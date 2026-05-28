import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/Button.jsx";
import { Field, Input } from "../components/Form.jsx";
import { Banner } from "../components/Primitives.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { errorMessage } from "../utils/format.js";
import config from "../config.js";

export function LoginPage() {
  const { user, login, bootLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [topError, setTopError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = `Sign in · ${config.appName}`;
  }, []);

  if (!bootLoading && user) {
    const to = location.state?.from?.pathname || "/home";
    return <Navigate to={to} replace />;
  }

  const submit = async (e) => {
    e?.preventDefault?.();
    const errs = {};
    if (!email) errs.email = "Enter your college email.";
    if (!password) errs.password = "Enter your password.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setTopError(null);
    try {
      await login({ email: email.trim(), password });
      navigate(location.state?.from?.pathname || "/home", { replace: true });
    } catch (err) {
      setTopError(errorMessage(err, "Couldn't sign in. Check your credentials."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <aside className="auth-hero">
        <div className="auth-form-brand">
          <div className="auth-hero-mark">{config.brandInitial}</div>
          <div>
            <div className="t-h1" style={{ color: "#fff" }}>{config.appName}</div>
            <div className="t-small" style={{ color: "rgba(255,255,255,0.7)" }}>{config.collegeName}</div>
          </div>
        </div>
        <div style={{ maxWidth: 480 }}>
          <h2 style={{ fontSize: 36, lineHeight: "44px", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
            One place for every event on campus.
          </h2>
          <p style={{ marginTop: 16, fontSize: 16, lineHeight: "24px", color: "rgba(255,255,255,0.85)" }}>
            Discover what's happening, RSVP in seconds, and walk in with a verified pass.
          </p>
        </div>
        <div className="t-caption" style={{ color: "rgba(255,255,255,0.6)" }}>
          {config.appTagline}
        </div>
      </aside>

      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit} noValidate>
          <div className="auth-form-brand" style={{ marginBottom: 8 }}>
            <div className="brand-mark">{config.brandInitial}</div>
            <div>
              <div className="t-strong">{config.appName}</div>
              <div className="t-small">{config.collegeName}</div>
            </div>
          </div>

          <div>
            <h1 className="t-display" style={{ margin: 0 }}>Sign in</h1>
            <p className="t-small" style={{ marginTop: 4 }}>Use your college email and password.</p>
          </div>

          <Field label="Email" error={errors.email} htmlFor="login-email">
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder={`name@${config.collegeName.toLowerCase().replace(/\s+/g, "")}.edu`}
              disabled={loading}
              autoComplete="email"
              inputMode="email"
            />
          </Field>

          <Field label="Password" error={errors.password} htmlFor="login-password">
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="At least 8 characters"
              disabled={loading}
              autoComplete="current-password"
            />
          </Field>

          {topError ? <Banner kind="danger">{topError}</Banner> : null}

          <Button variant="primary" size="lg" block loading={loading} type="submit">
            Sign in
          </Button>

          <div style={{ textAlign: "center" }} className="t-small">
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
