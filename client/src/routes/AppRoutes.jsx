import { Route, Routes } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import TeacherDashboardPage from "../pages/TeacherDashboardPage";
import StudentDashboardPage from "../pages/StudentDashboardPage";
import ClassesPage from "../pages/ClassesPage";
import ClassDetailPage from "../pages/ClassDetailPage";
import StudySetsPage from "../pages/StudySetsPage";
import StudySetFormPage from "../pages/StudySetFormPage";
import StudySetDetailPage from "../pages/StudySetDetailPage";
import LearnPage from "../pages/LearnPage";
import QuizPage from "../pages/QuizPage";
import TestPage from "../pages/TestPage";
import MatchPage from "../pages/MatchPage";
import AssignmentsPage from "../pages/AssignmentsPage";
import ImportPage from "../pages/ImportPage";
import ProfilePage from "../pages/ProfilePage";
import SettingsPage from "../pages/SettingsPage";
import NotFoundPage from "../pages/NotFoundPage";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/classes/:id" element={<ClassDetailPage />} />
          <Route path="/study-sets" element={<StudySetsPage />} />
          <Route path="/study-sets/:id" element={<StudySetDetailPage />} />
          <Route path="/learn/:id" element={<LearnPage />} />
          <Route path="/quiz/:id" element={<QuizPage />} />
          <Route path="/test/:id" element={<TestPage />} />
          <Route path="/match/:id" element={<MatchPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["teacher"]} />}>
          <Route path="/teacher" element={<TeacherDashboardPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["teacher", "admin"]} />}>
          <Route path="/study-sets/create" element={<StudySetFormPage mode="create" />} />
          <Route path="/study-sets/:id/edit" element={<StudySetFormPage mode="edit" />} />
          <Route path="/import" element={<ImportPage />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route path="/student" element={<StudentDashboardPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
