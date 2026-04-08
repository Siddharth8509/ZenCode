// App is the routing shell for ZenCode.
// It also restores the logged-in session once at startup so route guards can behave correctly.
import { useEffect, useRef, useState } from 'react'
import './App.css'
import Signupform from './pages/Signupform';
import Loginpage from './pages/Loginpage';
import Homepage from './pages/Homepage';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './authSlice';
import Problemset from './pages/Problemset';
import Adminpage from './pages/Adminpage';
import Problempage from './pages/Problempage';
import Profile from './pages/Profile';
import BackendWakeScreen from './components/BackendWakeScreen';
import { Generate } from './components/mock-interview/generate';
import { Dashboard } from './pages/mock-interview/dashboard';
import { CreateEditPage } from './pages/mock-interview/create-edit-page';
import { MockLoadPage } from './pages/mock-interview/mock-load-page';
import { MockInterviewPage } from './pages/mock-interview/mock-interview-page';
import { Feedback } from './pages/mock-interview/feedback';
import AIAnalyzer from './pages/AIAnalyzer';

// Aptitude Imports
import AptitudeHome from './pages/aptitude/pages/Home';
import AptitudePlatform from './pages/aptitude/pages/AptitudePlatform';
import QuestionDetail from './pages/aptitude/pages/QuestionDetail';
import MockPapers from './pages/aptitude/pages/MockPapers';
import Learn from './pages/aptitude/pages/Learn';
import AdminDashboardAptitude from './pages/aptitude/admin/AdminDashboard';
import AdminUploadAptitude from './pages/aptitude/admin/AdminUpload';
import AdminEditAptitude from './pages/aptitude/admin/AdminEdit';
import AddLecture from './pages/aptitude/admin/AddLecture';
import AdminPdfUpload from './pages/aptitude/admin/AdminPdfUpload';
import AdminPdfEdit from './pages/aptitude/admin/AdminPdfEdit';
import StudentDashboard from './pages/aptitude/components/StudentDashboard';

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

function App() {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const hasStartedAuthCheckRef = useRef(false);
  const [backendReady, setBackendReady] = useState(!/(?:^|\.)(?:onrender|render)\.com/i.test(API_HOSTNAME));
  const [secondsRemaining, setSecondsRemaining] = useState(COLD_START_WAIT_SECONDS);

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
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/problemset" /> : <Loginpage />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/problemset" /> : <Signupform />} />
        <Route path="/problemset" element={isAuthenticated ? <Problemset /> : <Navigate to="/login" />} />
        <Route path="/admin" element={isAuthenticated ? <Adminpage /> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/problem/:id" element={isAuthenticated ? <Problempage /> : <Navigate to="/login" />} />
        <Route path="/ai-analyzer" element={isAuthenticated ? <AIAnalyzer /> : <Navigate to="/login" />} />
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
          
          <Route path="admin" element={isAuthenticated ? <AdminDashboardAptitude /> : <Navigate to="/login" />} />
          <Route path="admin/add" element={isAuthenticated ? <AdminUploadAptitude /> : <Navigate to="/login" />} />
          <Route path="admin/edit/:id" element={isAuthenticated ? <AdminEditAptitude /> : <Navigate to="/login" />} />
          <Route path="admin/add-lecture" element={isAuthenticated ? <AddLecture /> : <Navigate to="/login" />} />
          <Route path="admin/upload-pdf" element={isAuthenticated ? <AdminPdfUpload /> : <Navigate to="/login" />} />
          <Route path="admin/edit-pdf/:id" element={isAuthenticated ? <AdminPdfEdit /> : <Navigate to="/login" />} />
        </Route>
      </Routes>
    </div>

  );
}

export default App;
