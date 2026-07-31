import { Navigate } from "react-router-dom";
import { useAuth } from "../src/context/AuthContext.jsx";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Checking session…</div>; // swap for a real spinner
  if (!user) return <Navigate to="/login" replace />;

  return children;
}