import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import InquiriesPage from './pages/InquiriesPage';
import InquiryFormPage from './pages/InquiryFormPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import MatchesPage from './pages/MatchesPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfilePage from './pages/ProfilePage';
import ProgramDetailsPage from './pages/ProgramDetailsPage';
import ProgramFormPage from './pages/ProgramFormPage';
import ProgramsPage from './pages/ProgramsPage';
import RegisterPage from './pages/RegisterPage';
import SavedPage from './pages/SavedPage';
import SchoolDashboardPage from './pages/SchoolDashboardPage';
import WhatIfPage from './pages/WhatIfPage';

/** All client-side routes. See docs/COMPONENTS_AND_ROUTES.md for the full table. */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="programs" element={<ProgramsPage />} />
        <Route path="programs/:id" element={<ProgramDetailsPage />} />

        {/* Student only */}
        <Route element={<ProtectedRoute role="student" />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="what-if" element={<WhatIfPage />} />
          <Route path="saved" element={<SavedPage />} />
          <Route path="inquiries" element={<InquiriesPage />} />
          <Route path="programs/:id/inquire" element={<InquiryFormPage />} />
        </Route>

        {/* School only */}
        <Route element={<ProtectedRoute role="school" />}>
          <Route path="school" element={<SchoolDashboardPage />} />
          <Route path="school/programs/new" element={<ProgramFormPage />} />
          <Route path="school/programs/:id/edit" element={<ProgramFormPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
