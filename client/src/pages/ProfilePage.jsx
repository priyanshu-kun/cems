import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button.jsx";
import { Avatar, Card, Pill } from "../components/Primitives.jsx";
import { Icon } from "../components/Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useModal } from "../context/ModalContext.jsx";
import { useEffect } from "react";
import config from "../config.js";

export function ProfilePage() {
  const { user, roles, logout, isAdmin, isOrganizer } = useAuth();
  const { openModal } = useModal();
  const navigate = useNavigate();

  useEffect(() => { document.title = `Profile · ${config.appName}`; }, []);

  const onSignOut = () =>
    openModal({
      title: `Sign out of ${config.appName}?`,
      primaryLabel: "Sign out",
      primaryVariant: "danger",
      onPrimary: () => { logout(); navigate("/login", { replace: true }); },
    });

  return (
    <div className="col gap-6">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="t-display" style={{ margin: 0 }}>Profile</h1>
          <div className="t-small">Your account and access.</div>
        </div>
      </header>

      <Card>
        <div className="row gap-4" style={{ alignItems: "center" }}>
          <Avatar name={user?.fullName || user?.name} size="lg" />
          <div className="col gap-1" style={{ minWidth: 0 }}>
            <div className="t-h1">{user?.fullName || user?.name || "—"}</div>
            <div className="t-small truncate">{user?.email || "—"}</div>
            <div className="row gap-1 mt-2">
              {roles.map((r) => <Pill key={r} tone="info">{r.toLowerCase()}</Pill>)}
            </div>
          </div>
        </div>
      </Card>

      <Card className="card-flush">
        <div className="list">
          <Row label="Department" value={user?.department || "—"} />
          <Row label="Year" value={user?.year ? `Year ${user.year}` : "—"} />
          <Row label="Email verified" value={user?.isEmailVerified ? "Yes" : "No"} />
          {user?.lastLoginAt ? <Row label="Last login" value={new Date(user.lastLoginAt).toLocaleString()} /> : null}
        </div>
      </Card>

      {(isAdmin || isOrganizer) ? (
        <Card className="card-flush">
          <div className="list">
            {(isAdmin || isOrganizer) ? (
              <button className="row-item" onClick={() => navigate("/assets")}>
                <div style={{ flex: 1 }} className="col gap-1">
                  <div className="t-strong">Manage assets</div>
                  <div className="t-small">Reserve mics, chairs, projectors, and more.</div>
                </div>
                <Icon name="chevron-right" color="var(--color-text-secondary)" />
              </button>
            ) : null}
            {isAdmin ? (
              <button className="row-item" onClick={() => navigate("/scanner")}>
                <div style={{ flex: 1 }} className="col gap-1">
                  <div className="t-strong">Gate scanner</div>
                  <div className="t-small">Verify and consume passes at the gate.</div>
                </div>
                <Icon name="chevron-right" color="var(--color-text-secondary)" />
              </button>
            ) : null}
          </div>
        </Card>
      ) : null}

      <Button variant="ghost" leadingIcon="logout" onClick={onSignOut} style={{ color: "var(--color-danger)", alignSelf: "flex-start" }}>
        Sign out
      </Button>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="row-item" style={{ cursor: "default" }}>
      <div className="col gap-1" style={{ flex: 1 }}>
        <div className="t-caption">{label}</div>
        <div className="t-body">{value}</div>
      </div>
    </div>
  );
}
