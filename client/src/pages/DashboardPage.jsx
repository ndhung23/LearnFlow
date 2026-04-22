import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (user.role === "teacher") {
    return <Navigate to="/teacher" replace />;
  }

  return <Navigate to="/student" replace />;
}

export default DashboardPage;
