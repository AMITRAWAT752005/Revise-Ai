import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

const Signup = lazy(() => import('./pages/Auth/Signup'));
const Login = lazy(() => import('./pages/Auth/Login'));
const ForgotPassword = lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/Auth/ResetPassword'));
const OTPVerification = lazy(() => import('./pages/Auth/OTPVerification'));
const Commitment = lazy(() => import('./pages/Commitment/Commitment'));
const Home = lazy(() => import('./pages/Home/Home'));
const Revision = lazy(() => import('./pages/Revision/Revision'));
const SyllabusSetup = lazy(() => import('./pages/SyllabusSetup/SyllabusSetup'));
const Subjects = lazy(() => import('./pages/Subjects/Subjects'));
const SubjectWorkspace = lazy(() => import('./pages/SubjectWorkspace/SubjectWorkspace'));
const UnitDetail = lazy(() => import('./pages/UnitDetail/UnitDetail'));
const TopicDetail = lazy(() => import('./pages/TopicDetail/TopicDetail'));

const RouteLoading = () => (
  <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#464554' }}>
    Loading ReviseAI...
  </div>
);

function App() {
  return (
    <Router>
      <div className="app-container">
        <Suspense fallback={<RouteLoading />}>
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
          <Route path="/subjects" element={<ProtectedRoute><Subjects /></ProtectedRoute>} />
          <Route path="/subjects/create" element={<ProtectedRoute><Subjects initialCreateModalOpen={true} /></ProtectedRoute>} />
          <Route path="/subjects/:subjectId" element={<ProtectedRoute><SubjectWorkspace /></ProtectedRoute>} />
          <Route path="/subjects/:subjectId/units/:unitId" element={<ProtectedRoute><UnitDetail /></ProtectedRoute>} />
          <Route path="/subjects/:subjectId/units/:unitId/topics/:topicId" element={<ProtectedRoute><TopicDetail /></ProtectedRoute>} />
          <Route path="/revision" element={<ProtectedRoute><Revision /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><div style={{ padding: '40px', fontFamily: 'Inter, sans-serif' }}><h2>Analytics (Phase 5)</h2><p>This section is part of upcoming Phase 5.</p><a href="/home" style={{ color: '#4441cc', fontWeight: 600 }}>← Back to Dashboard</a></div></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><div style={{ padding: '40px', fontFamily: 'Inter, sans-serif' }}><h2>Settings</h2><p>User settings will be available in future releases.</p><a href="/home" style={{ color: '#4441cc', fontWeight: 600 }}>← Back to Dashboard</a></div></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;

