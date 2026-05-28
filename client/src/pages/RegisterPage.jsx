import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "../components/Button.jsx";
import { Field, Input, Select } from "../components/Form.jsx";
import { Banner } from "../components/Primitives.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { errorMessage } from "../utils/format.js";
import config from "../config.js";

export function RegisterPage() {
  const { user, register, bootLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: "", email: "", password: "", department: "", year: "" });
  const [errors, setErrors] = useState({});
  const [topError, setTopError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = `Create account · ${config.appName}`; }, []);

  if (!bootLoading && user) return <Navigate to="/home" replace />;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e?.preventDefault?.();
    const errs = {};
    if (!form.fullName || form.fullName.trim().length < 2) errs.fullName = "Tell us your full name.";
    if (!form.email) errs.email = "Enter your college email.";
    if (!form.password) errs.password = "Pick a password.";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    setTopError(null);
    try {
      await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        department: form.department || undefined,
        year: form.year ? Number(form.year) : undefined,
      });
      navigate("/home", { replace: true });
    } catch (err) {
      setTopError(errorMessage(err, "Couldn't create your account."));
      // Attach inline field errors from VALIDATION_ERROR.details
      if (err?.details) {
        const fieldErrs = {};
        Object.entries(err.details).forEach(([k, v]) => {
          const key = k.split(".").pop();
          fieldErrs[key] = v;
        });
        setErrors(fieldErrs);
      }
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
            Join the campus event scene.
          </h2>
          <p style={{ marginTop: 16, fontSize: 16, lineHeight: "24px", color: "rgba(255,255,255,0.85)" }}>
            Sign up with your college email and we'll personalize what you see.
          </p>
        </div>
        <div className="t-caption" style={{ color: "rgba(255,255,255,0.6)" }}>
          {config.appTagline}
        </div>
      </aside>

      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit} noValidate>
          <div>
            <h1 className="t-display" style={{ margin: 0 }}>Create account</h1>
            <p className="t-small" style={{ marginTop: 4 }}>
              Use your college-issued email so your department auto-populates later.
            </p>
          </div>

          <Field label="Full name" error={errors.fullName} htmlFor="reg-name">
            <Input id="reg-name" value={form.fullName} onChange={(v) => set("fullName", v)} placeholder="e.g. Ananya Reddy" />
          </Field>

          <Field label="Email" error={errors.email} htmlFor="reg-email">
            <Input id="reg-email" type="email" value={form.email} onChange={(v) => set("email", v)} placeholder="name@college.edu" inputMode="email" />
          </Field>

          <Field
            label="Password"
            helper={errors.password ? null : "Minimum 8 characters."}
            error={errors.password}
            htmlFor="reg-pw"
          >
            <Input id="reg-pw" type="password" value={form.password} onChange={(v) => set("password", v)} placeholder="At least 8 characters" />
          </Field>

          <div className="row gap-3">
            <Field label="Department (optional)" error={errors.department} htmlFor="reg-dept">
              <Select
                id="reg-dept"
                value={form.department}
                onChange={(v) => set("department", v)}
                options={config.departments}
                placeholder="Choose"
              />
            </Field>
            <Field label="Year (optional)" error={errors.year} htmlFor="reg-year">
              <Select
                id="reg-year"
                value={form.year}
                onChange={(v) => set("year", v)}
                options={config.years.map((y) => ({ value: y, label: `Year ${y}` }))}
                placeholder="Choose"
              />
            </Field>
          </div>

          {topError ? <Banner kind="danger">{topError}</Banner> : null}

          <Button variant="primary" size="lg" block loading={loading} type="submit">
            Create account
          </Button>

          <div style={{ textAlign: "center" }} className="t-small">
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}>
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
