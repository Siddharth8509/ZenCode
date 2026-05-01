// App is the routing shell for ZenCode.
// It also restores the logged-in session once at startup so route guards can behave correctly.
import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import './App.css'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './authSlice';
import BackendWakeScreen from './components/BackendWakeScreen';
import Navbar from './components/Navbar';
const Signupform = lazy(() => import('./pages/Signupform'));
const Loginpage = lazy(() => import('./pages/Loginpage'));
const Homepage = lazy(() => import('./pages/Homepage'));
const Problemset = lazy(() => import('./pages/Problemset'));
const Adminpage = lazy(() => import('./pages/Adminpage'));
const Problempage = lazy(() => import('./pages/Problempage'));
const Profile = lazy(() => import('./pages/Profile'));
const AIAnalyzer = lazy(() => import('./pages/AIAnalyzer'));
const AIAnalyzerReport = lazy(() => import('./pages/AIAnalyzerReport'));

const Generate = lazy(() =>
  import('./components/mock-interview/generate').then((module) => ({ default: module.Generate }))
);
const Dashboard = lazy(() =>
  import('./pages/mock-interview/dashboard').then((module) => ({ default: module.Dashboard }))
);
const CreateEditPage = lazy(() =>
  import('./pages/mock-interview/create-edit-page').then((module) => ({ default: module.CreateEditPage }))
);
const MockLoadPage = lazy(() =>
  import('./pages/mock-interview/mock-load-page').then((module) => ({ default: module.MockLoadPage }))
);
const MockInterviewPage = lazy(() =>
  import('./pages/mock-interview/mock-interview-page').then((module) => ({ default: module.MockInterviewPage }))
);
const Feedback = lazy(() =>
  import('./pages/mock-interview/feedback').then((module) => ({ default: module.Feedback }))
);

const AptitudeHome = lazy(() => import('./pages/aptitude/pages/Home'));
const AptitudePlatform = lazy(() => import('./pages/aptitude/pages/AptitudePlatform'));
const QuestionDetail = lazy(() => import('./pages/aptitude/pages/QuestionDetail'));
const MockPapers = lazy(() => import('./pages/aptitude/pages/MockPapers'));
const Learn = lazy(() => import('./pages/aptitude/pages/Learn'));
const AdminDashboardAptitude = lazy(() => import('./pages/aptitude/admin/AdminDashboard'));
const AdminUploadAptitude = lazy(() => import('./pages/aptitude/admin/AdminUpload'));
const AdminEditAptitude = lazy(() => import('./pages/aptitude/admin/AdminEdit'));
const AddLecture = lazy(() => import('./pages/aptitude/admin/AddLecture'));
const AdminPdfUpload = lazy(() => import('./pages/aptitude/admin/AdminPdfUpload'));
const AdminPdfEdit = lazy(() => import('./pages/aptitude/admin/AdminPdfEdit'));
const StudentDashboard = lazy(() => import('./pages/aptitude/components/StudentDashboard'));

const ResumeBuilderDashboard = lazy(() => import('./pages/resume-builder/Dashboard'));
const ResumeBuilderApp = lazy(() => import('./pages/resume-builder/ResumeBuilder'));
const ResumeBuilderPreview = lazy(() => import('./pages/resume-builder/Preview'));

const LearningDashboard = lazy(() => import('./pages/learning/LearningDashboard'));
const CSMasterclass = lazy(() => import('./pages/learning/CSMasterclass'));
const PdfViewer = lazy(() => import('./pages/learning/PdfViewer'));
const PdfUpload = lazy(() => import('./pages/learning/PdfUpload'));
const LearningAdmin = lazy(() => import('./pages/learning/LearningAdmin'));

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
const API_HOSTNAME = (() => {
  try {
    return new URL(API_BASE_URL).hostname;
  } catch {
    return "";
  }
})();
const COLD_START_WAIT_SECONDS = 60;
const BACKEND_POLL_INTERVAL_MS = 3000;
const BACKEND_REQUEST_TIMEOUT_MS = 5000;

async function pingBackendHealth() {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), BACKEND_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function RouteFallback({ showGlobalNavbar = true }) {
  return (
    <div className={`${showGlobalNavbar ? "min-h-[calc(100vh-64px)]" : "min-h-screen"} bg-black text-neutral-300 flex items-center justify-center px-6`}>
      <div className="glass-panel px-6 py-4 rounded-2xl border border-white/10">Loading page...</div>
    </div>
  );
}

function App() {
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const hasStartedAuthCheckRef = useRef(false);
  const [backendReady, setBackendReady] = useState(!/(?:^|\.)(?:onrender|render)\.com/i.test(API_HOSTNAME));
  const [secondsRemaining, setSecondsRemaining] = useState(COLD_START_WAIT_SECONDS);
  const isProblemIdeRoute = /^\/problem\/[^/]+$/.test(location.pathname);
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';
  const showGlobalNavbar = !isProblemIdeRoute;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (backendReady || hasStartedAuthCheckRef.current) return;

    let isCancelled = false;
    let pollTimeoutId = null;
    let countdownIntervalId = null;

    const checkBackend = async () => {
      const isLive = await pingBackendHealth();
      if (isCancelled) return;

      if (isLive) {
        setBackendReady(true);
        return;
      }

      pollTimeoutId = window.setTimeout(checkBackend, BACKEND_POLL_INTERVAL_MS);
    };

    countdownIntervalId = window.setInterval(() => {
      setSecondsRemaining((previous) => Math.max(0, previous - 1));
    }, 1000);

    checkBackend();

    return () => {
      isCancelled = true;
      if (pollTimeoutId) {
        window.clearTimeout(pollTimeoutId);
      }
      if (countdownIntervalId) {
        window.clearInterval(countdownIntervalId);
      }
    };
  }, [backendReady]);

  useEffect(() => {
    if (!backendReady || hasStartedAuthCheckRef.current) return;

    hasStartedAuthCheckRef.current = true;

    // We ask the backend once on app boot whether the cookie still represents a live session.
    dispatch(checkAuth());
  }, [backendReady, dispatch]);

  if (!backendReady) {
    return <BackendWakeScreen secondsRemaining={secondsRemaining} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-neutral-300 flex items-center justify-center">
        <div className="glass-panel px-6 py-4 rounded-2xl border border-white/10">Checking session...</div>
      </div>
    );
  }

  return (
    <div className='app'>
      {/* Global Navbar — always visible */}
      {showGlobalNavbar && <Navbar />}
      <div style={{ paddingTop: showGlobalNavbar && !isAuthRoute ? '64px' : '0px' }}>
        <Suspense fallback={<RouteFallback showGlobalNavbar={showGlobalNavbar} />}>
          <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/problemset" /> : <Loginpage />} />
          <Route path="/signup" element={isAuthenticated ? <Navigate to="/problemset" /> : <Signupform />} />
          <Route path="/problemset" element={isAuthenticated ? <Problemset /> : <Navigate to="/login" />} />
          <Route path="/admin" element={isAuthenticated ? <Adminpage /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/problem/:id" element={isAuthenticated ? <Problempage /> : <Navigate to="/login" />} />
          <Route path="/ai-analyzer" element={isAuthenticated ? <AIAnalyzer /> : <Navigate to="/login" />} />
          <Route path="/ai-analyzer/report/:id" element={isAuthenticated ? <AIAnalyzerReport /> : <Navigate to="/login" />} />
          <Route path="/smart-resume-analyzer" element={<Navigate to="/ai-analyzer" replace />} />
          <Route path="/resume-maker" element={<Navigate to="/ai-analyzer" replace />} />

          <Route path="/mock-interview" element={isAuthenticated ? <Generate /> : <Navigate to="/login" />}>
            <Route index element={<Dashboard />} />
            <Route path="create" element={<CreateEditPage />} />
            <Route path="interview/:interviewId" element={<MockLoadPage />} />
            <Route path="interview/:interviewId/start" element={<MockInterviewPage />} />
            <Route path="feedback/:interviewId" element={<Feedback />} />
          </Route>

          {/* Aptitude Routes */}
          <Route path="/aptitude">
            <Route index element={isAuthenticated ? <AptitudeHome /> : <Navigate to="/login" />} />
            <Route path="platform" element={isAuthenticated ? <AptitudePlatform /> : <Navigate to="/login" />} />
            <Route path="question/:id" element={isAuthenticated ? <QuestionDetail /> : <Navigate to="/login" />} />
            <Route path="mock" element={isAuthenticated ? <MockPapers /> : <Navigate to="/login" />} />
            <Route path="learn/:courseType" element={isAuthenticated ? <Learn /> : <Navigate to="/login" />} />
            <Route path="learn" element={<Navigate to="/aptitude/learn/aptitude" replace />} />
            <Route path="dashboard" element={isAuthenticated ? <StudentDashboard /> : <Navigate to="/login" />} />
            
            <Route
              path="admin"
              element={
                isAuthenticated
                  ? (isAdmin ? <AdminDashboardAptitude /> : <Navigate to="/aptitude" replace />)
                  : <Navigate to="/login" />
              }
            />
            <Route
              path="admin/add"
              element={
                isAuthenticated
                  ? (isAdmin ? <AdminUploadAptitude /> : <Navigate to="/aptitude" replace />)
                  : <Navigate to="/login" />
              }
            />
            <Route
              path="admin/edit/:id"
              element={
                isAuthenticated
                  ? (isAdmin ? <AdminEditAptitude /> : <Navigate to="/aptitude" replace />)
                  : <Navigate to="/login" />
              }
            />
            <Route
              path="admin/add-lecture"
              element={
                isAuthenticated
                  ? (isAdmin ? <AddLecture /> : <Navigate to="/aptitude" replace />)
                  : <Navigate to="/login" />
              }
            />
            <Route
              path="admin/upload-pdf"
              element={
                isAuthenticated
                  ? (isAdmin ? <AdminPdfUpload /> : <Navigate to="/aptitude" replace />)
                  : <Navigate to="/login" />
              }
            />
            <Route
              path="admin/edit-pdf/:id"
              element={
                isAuthenticated
                  ? (isAdmin ? <AdminPdfEdit /> : <Navigate to="/aptitude" replace />)
                  : <Navigate to="/login" />
              }
            />
          </Route>

          {/* Resume Builder Routes */}
          <Route path="/resume-builder">
            <Route index element={isAuthenticated ? <ResumeBuilderDashboard /> : <Navigate to="/login" />} />
            <Route path="builder/:resumeId" element={isAuthenticated ? <ResumeBuilderApp /> : <Navigate to="/login" />} />
            <Route path="view/:resumeId" element={<ResumeBuilderPreview />} />
          </Route>

          {/* Learning Routes */}
          <Route path="/learning">
            <Route index element={isAuthenticated ? <LearningDashboard /> : <Navigate to="/login" />} />
            <Route path="cs-core" element={isAuthenticated ? <CSMasterclass /> : <Navigate to="/login" />} />
            <Route path="materials" element={isAuthenticated ? <PdfViewer /> : <Navigate to="/login" />} />
            <Route
              path="upload"
              element={
                isAuthenticated
                  ? (isAdmin ? <PdfUpload /> : <Navigate to="/learning" replace />)
                  : <Navigate to="/login" />
              }
            />
            <Route
              path="admin"
              element={
                isAuthenticated
                  ? (isAdmin ? <LearningAdmin /> : <Navigate to="/learning" replace />)
                  : <Navigate to="/login" />
              }
            />
          </Route>
          </Routes>
        </Suspense>
      </div>
    </div>
  );
}

export default App;
