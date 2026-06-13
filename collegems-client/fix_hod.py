import os
path = "src/pages/HODDashboard.tsx"
with open(path, "r") as f:
    lines = f.readlines()

# Find the second export default function HODDashboard() {
idx = -1
for i in range(100, len(lines)):
    if "export default function HODDashboard() {" in lines[i]:
        idx = i
        break

if idx != -1:
    header = """import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutGrid, Users, GraduationCap, BookOpen, Building2, FileText,
  Wallet, DollarSign, Calendar, Menu, X, RefreshCw, ChevronRight,
  Bell, Search, UserCircle, LogOut, Settings, CalendarDays,
  Moon, Sun, MessageSquare, Award, Bus
} from "lucide-react";
import api from "../api/axios";
import Students from "../common-components-management/Students";
import HODSalary from "../hod-components/Salary";
import HODTeacherAttendance from "../hod-components/TeacherAttendance";
import AcademicCalendar from "../common-components-management/AcademicCalendar";
import Teachers from "../hod-components/Teachers";
import Library from "../common-components-management/Library";
import HODSettings from "../hod-components/Settings";
import HODCourses from "../hod-components/Courses";
import ExamForms from "../hod-components/ExamForms";
import AnnouncementForm from "../common-components-management/AnnouncementForm";
import AnnouncementManage from "../common-components-management/AnnouncementManage";
import FeedbackManagement from "../hod-components/FeedbackManagement";
import Scholarships from "../common-components-management/Scholarships";
import BusRoutes from "../common-components-management/BusRoutes";
import ExamHalls from "../hod-components/ExamHalls";
import HallAllocation from "../hod-components/HallAllocation";
import AuditLogs from "../hod-components/AuditLogs";
import BookingManagement from "../hod-components/BookingManagement";
import ResourceManagement from "../hod-components/ResourceManagement";

type TabType =
  | "overview"
  | "announcements"
  | "teachers"
  | "teachers-attendance"
  | "students"
  | "courses"
  | "classes"
  | "syllabus"
  | "fees"
  | "salary"
  | "examSchedule"
  | "events"
  | "academic-calendar"
  | "library"
  | "settings"
  | "reports"
  | "feedback"
  | "exam-forms"
  | "scholarships"
  | "bus-routes"
  | "exam-halls"
  | "hall-allocation"
  | "audit-logs"
  | "manage-bookings"
  | "manage-resources";

interface Data {
  cards: Array<{ title: string; value: number }>;
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalClassess: number;
}

interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  departmentCode?: string;
  role: string;
  avatarUrl?: string;
}

const navigationItems = [
  { id: "overview" as TabType, label: "Overview", icon: LayoutGrid },
  { id: "announcements", label: "Announcements", icon: Bell },
  { id: "teachers" as TabType, label: "Teachers", icon: Users },
  { id: "teachers-attendance" as TabType, label: "Teachers Attendance", icon: Users },
  { id: "students" as TabType, label: "Students", icon: GraduationCap },
  { id: "academic-calendar" as TabType, label: "Academic Calendar", icon: Calendar },
  { id: "courses" as TabType, label: "Courses", icon: BookOpen },
  { id: "classes" as TabType, label: "Classes", icon: Building2 },
  { id: "syllabus" as TabType, label: "Syllabus", icon: FileText },
  { id: "fees" as TabType, label: "Fees", icon: Wallet },
  { id: "salary" as TabType, label: "Salary", icon: DollarSign },
  { id: "examSchedule" as TabType, label: "Exam Schedule", icon: Calendar },
  { id: "events" as TabType, label: "Organize Events", icon: CalendarDays },
  { id: "library" as TabType, label: "Library Catalog", icon: BookOpen },
  { id: "reports" as TabType, label: "Report Generator", icon: FileText },
  { id: "feedback" as TabType, label: "Feedback", icon: MessageSquare },
  { id: "exam-forms" as TabType, label: "Exam Forms", icon: FileText },
  { id: "scholarships" as TabType, label: "Scholarship Approvals", icon: Award },
  { id: "bus-routes" as TabType, label: "Bus Routes Management", icon: Bus },
  { id: "exam-halls" as TabType, label: "Exam Halls", icon: Building2 },
  { id: "hall-allocation" as TabType, label: "Hall Allocation", icon: Users },
  { id: "audit-logs" as TabType, label: "Audit Logs", icon: FileText },
  { id: "manage-bookings" as TabType, label: "Manage Bookings", icon: Calendar },
  { id: "manage-resources" as TabType, label: "Manage Resources", icon: Building2 },
];

"""
    new_content = header + "".join(lines[idx:])
    with open(path, "w") as f:
        f.write(new_content)
    print("Fixed HODDashboard.tsx")
else:
    print("Could not find second HODDashboard function")
