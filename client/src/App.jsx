import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import InternshipList from './pages/InternshipList';
import InternshipDetails from './pages/InternshipDetails';
import MyApplications from './pages/MyApplications';
import CompanyDashboard from './pages/CompanyDashboard';
import CreateInternship from './pages/CreateInternship';
import ApplicantsView from './pages/ApplicantsView';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<AuthPage />} />

              {/* Student Routes */}
              <Route path="/student/internships" element={
                <ProtectedRoute role="student"><InternshipList /></ProtectedRoute>
              } />
              <Route path="/student/internship/:id" element={
                <ProtectedRoute role="student"><InternshipDetails /></ProtectedRoute>
              } />
              <Route path="/student/applications" element={
                <ProtectedRoute role="student"><MyApplications /></ProtectedRoute>
              } />

              {/* Company Routes */}
              <Route path="/company/dashboard" element={
                <ProtectedRoute role="company"><CompanyDashboard /></ProtectedRoute>
              } />
              <Route path="/company/create" element={
                <ProtectedRoute role="company"><CreateInternship /></ProtectedRoute>
              } />
              <Route path="/company/applicants/:internshipId" element={
                <ProtectedRoute role="company"><ApplicantsView /></ProtectedRoute>
              } />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
