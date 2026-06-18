import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import RoleRoute from "./routes/RoleRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import HodDashboard from "./pages/HODDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import MainDashboard from "./pages/MainDashboard";
import ExamSchedule from "./user-components/ExamSchedule";
import Courses from "./user-components/Courses";
import Teachers from "./hod-components/Teachers";
import StudentResults from "./user-components/StudentResults";
import EventsStudent from "./user-components/EventsStudent";
import QuickAccessAll from "./pages/QuickAccessAll";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ReportGenerator from "./pages/ReportGenerator";
import ExaminationFormPage from "./pages/ExaminationFormPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        <Route
          path="/examschedule"
          element={
            <ProtectedRoute>
              <ExamSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/results"
          element={
            <ProtectedRoute>
              <StudentResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <EventsStudent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/courses"
          element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/timetable"
          element={
            <ProtectedRoute>
              <div>Timetable Page</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/faculty"
          element={
            <ProtectedRoute>
              <Teachers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quickaccess"
          element={
            <ProtectedRoute>
              <QuickAccessAll />
            </ProtectedRoute>
          }
        />
       
        <Route
          path="/student/dashboard"
          element={
            <RoleRoute role="student">
              <StudentDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/student/exam-form"
          element={
            <RoleRoute role="student">
              <ExaminationFormPage />
            </RoleRoute>
          }
        />
        <Route
          path="/teacher/dashboard"
          element={
            <RoleRoute role="teacher">
              <TeacherDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/hod/dashboard"
          element={
            <RoleRoute role="hod">
              <HodDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/hod/reports"
          element={
            <RoleRoute role="hod">
              <ReportGenerator />
            </RoleRoute>
          }
        />
        <Route
          path="/parent/dashboard"
          element={
            <RoleRoute role="parent">
              <ParentDashboard />
            </RoleRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
