import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Spinner } from "./Primitives.jsx";

export function ProtectedRoute({ children, roles }) {
  const { user, bootLoading, roles: userRoles } = useAuth();
  const location = useLocation();

  if (bootLoading) {
    return (
      <div className="boot">
        <Spinner size={28} />
        <div className="t-small" style={{ marginTop: 12 }}>Checking your session…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.some((r) => userRoles.includes(r))) {
    return (
      <div className="empty">
        <div className="t-strong">Restricted area</div>
        <div className="t-small">You don't have access to this section.</div>
      </div>
    );
  }

  return children;
}
