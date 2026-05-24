import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/auth/login";
import SignUpPage from "./pages/auth/SignUpPage";
import CreateUsers from "./pages/Users/CreateUsers";
import AllStudents from "./pages/Users/AllStudents";
import CreateClass from "./pages/Class/CreateClass";
import ClassroomDetail from "./pages/Student/DisplayClassroom";
import StudentFees from "./pages/Student/Fees";
import StudentAssignmentDetail from "./pages/Student/AssignmentDetail";
import TeacherClassroom from "./pages/Teacher/TeacherClassromm";
import ClassStudents from "./pages/Teacher/ClassStudents";
import CreateAssignment from "./pages/Teacher/CreateAssignment";
import CreateNotice from "./pages/Teacher/CreateNotice";
import AssignmentDetail from "./pages/Teacher/AssignmentDetail";
import SubmissionList from "./pages/Teacher/SubmissionList";
import TeacherStudyMaterials from "./pages/Teacher/StudyMaterials";
import StudentStudyMaterials from "./pages/Student/StudyMaterials";
import Navbar from "./components/NavBar";
import LoadingSpinner from "./components/LoadingSpinner";

function App() {
  const getDefaultRoute = () => {
    if (!authUser) return "/login";

    if (authUser.role === "student") return "/student/classroom";
    if (authUser.role === "teacher") return "/teacher/classroom";
    if (authUser.role === "admin") return "/admin/users/create";

    return "/login";
  };

  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      } catch (error) {
        // console.error("Auth error:", error);
        return null;
      }
    },
    retry: false,
   });
  

  if (isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      {authUser && <Navbar authUser={authUser} />}
      <Routes>
        <Route
          path="/"
          element={<Navigate to={getDefaultRoute()} replace />}
        />
        <Route
          path="/admin/users/create"
          element={authUser?.role === "admin" ? <CreateUsers /> : <Navigate to="/" />}
        />

        <Route
          path="/admin/students"
          element={authUser?.role === "admin" ? <AllStudents /> : <Navigate to="/" />}
        />

        <Route
          path="/admin/classes"
          element={authUser?.role === "admin" ? <CreateClass /> : <Navigate to="/" />}
        />

        <Route
          path="/student/classroom"
          element={authUser?.role === "student" ? <ClassroomDetail authUser={authUser} /> : <Navigate to="/" />}
        />

        <Route
          path="/student/fees"
          element={authUser?.role === "student" ? <StudentFees authUser={authUser} /> : <Navigate to="/" />}
        />

        <Route
          path="/student/assignments/:assignmentId"
          element={authUser?.role === "student" ? <StudentAssignmentDetail /> : <Navigate to="/" />}
        />

        <Route
          path="/teacher/classroom"
          element={authUser?.role === "teacher" ? <TeacherClassroom authUser={authUser} /> : <Navigate to="/" />}
        />

        <Route
          path="/teacher/classes/:classId"
          element={authUser?.role === "teacher" ? <ClassStudents /> : <Navigate to="/" />}
        />

        <Route
          path="/teacher/classes/:classId/students"
          element={authUser?.role === "teacher" ? <ClassStudents /> : <Navigate to="/" />}
        />

        <Route
          path="/teacher/notices/create"
          element={authUser?.role === "teacher" ? <CreateNotice authUser={authUser} /> : <Navigate to="/" />}
        />

        <Route
          path="/teacher/assignments/new"
          element={authUser?.role === "teacher" ? <CreateAssignment authUser={authUser} /> : <Navigate to="/" />}
        />

        <Route
          path="/teacher/study-materials"
          element={authUser?.role === "teacher" ? <TeacherStudyMaterials authUser={authUser} /> : <Navigate to="/" />}
        />

        <Route
          path="/teacher/assignments/:assignmentId"
          element={authUser?.role === "teacher" ? <AssignmentDetail /> : <Navigate to="/" />}
        />

        <Route
          path="/teacher/assignments/:assignmentId/submissions"
          element={authUser?.role === "teacher" ? <SubmissionList /> : <Navigate to="/" />}
        />

        

        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />

        <Route
          path="/student/study-materials"
          element={authUser?.role === "student" ? <StudentStudyMaterials /> : <Navigate to="/" />}
        />

        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
