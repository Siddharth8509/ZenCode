// App is the routing shell for ZenCode.
// It also restores the logged-in session once at startup so route guards can behave correctly.
import { useEffect } from 'react'
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

function App() {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // We ask the backend once on app boot whether the cookie still represents a live session.
    dispatch(checkAuth());
  }, [dispatch])

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
      </Routes>
    </div>

  );
}

export default App;
