import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Auth/Signup';
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import OTPVerification from './pages/Auth/OTPVerification';
import Commitment from './pages/Commitment/Commitment';
import Home from './pages/Home/Home';
import Revision from './pages/Revision/Revision';
import SyllabusSetup from './pages/SyllabusSetup/SyllabusSetup';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/otp-verification" element={<OTPVerification />} />
          <Route path="/commitment" element={<ProtectedRoute><Commitment /></ProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/syllabus-setup" element={<ProtectedRoute><SyllabusSetup /></ProtectedRoute>} />
          <Route path="/subjects" element={<ProtectedRoute><div style={{ padding: '40px', fontFamily: 'Inter, sans-serif' }}><h2>Subjects (Phase 3)</h2><p>This section is part of upcoming Phase 3.</p><a href="/home" style={{ color: '#4441cc', fontWeight: 600 }}>← Back to Dashboard</a></div></ProtectedRoute>} />
          <Route path="/revision" element={<ProtectedRoute><Revision /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><div style={{ padding: '40px', fontFamily: 'Inter, sans-serif' }}><h2>Analytics (Phase 5)</h2><p>This section is part of upcoming Phase 5.</p><a href="/home" style={{ color: '#4441cc', fontWeight: 600 }}>← Back to Dashboard</a></div></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><div style={{ padding: '40px', fontFamily: 'Inter, sans-serif' }}><h2>Settings</h2><p>User settings will be available in future releases.</p><a href="/home" style={{ color: '#4441cc', fontWeight: 600 }}>← Back to Dashboard</a></div></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

