// CEMS — Auth screens: Login, Register

const COLLEGE = window.CEMS_DATA.COLLEGE_NAME;

function LoginScreen({ onSignedIn, demoState = "default" }) {
  const [email, setEmail] = React.useState("aarav.s22@glauniversity.in");
  const [password, setPassword] = React.useState("••••••••");
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [topError, setTopError] = React.useState(null);

  React.useEffect(() => {
    if (demoState === "loading") setLoading(true);
    else if (demoState === "error") setTopError("Email or password is incorrect.");
    else if (demoState === "empty") { setEmail(""); setPassword(""); }
    else { setLoading(false); setTopError(null); setErrors({}); }
  }, [demoState]);

  const submit = () => {
    const errs = {};
    if (!email) errs.email = "Enter your college email.";
    if (!password) errs.password = "Enter your password.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setTopError(null);
    setTimeout(() => {
      setLoading(false);
      onSignedIn?.();
    }, 700);
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-brand-mark">C</div>
        <div>
          <div className="t-strong">CEMS</div>
          <div className="t-small">{COLLEGE}</div>
        </div>
      </div>

      <div className="col gap-2" style={{marginTop: 24}}>
        <div className="t-display">Sign in</div>
        <div className="t-small">Use your college email and password.</div>
      </div>

      <div className="col gap-4" style={{marginTop: 8}}>
        <Field label="College email" error={errors.email} htmlFor="login-email">
          <Input id="login-email" type="email" value={email} onChange={setEmail}
                 placeholder="name@glauniversity.in" disabled={loading} autoComplete="email" inputMode="email" />
        </Field>
        <Field label="Password" error={errors.password} htmlFor="login-password">
          <Input id="login-password" type="password" value={password} onChange={setPassword}
                 placeholder="At least 8 characters" disabled={loading} autoComplete="current-password" />
        </Field>

        {topError ? <Banner kind="danger">{topError}</Banner> : null}

        <Button variant="primary" block loading={loading} onClick={submit}>Sign in</Button>
        <div style={{textAlign:"center"}} className="t-small">
          Don't have an account? <a style={{color:"var(--color-primary)", fontWeight:600, textDecoration:"none"}}
                                       href="#" onClick={e => { e.preventDefault(); onSignedIn?.("register"); }}>Sign up</a>
        </div>
        <div style={{textAlign:"center"}} className="t-caption">
          <a style={{color:"var(--color-text-secondary)", textDecoration:"none"}} href="#" onClick={e => e.preventDefault()}>Forgot password?</a>
        </div>
      </div>
    </div>
  );
}

function RegisterScreen({ onSignedIn, onBack, demoState = "default" }) {
  const [form, setForm] = React.useState({ name: "", email: "", password: "", dept: "", year: "" });
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [topError, setTopError] = React.useState(null);

  React.useEffect(() => {
    if (demoState === "loading") setLoading(true);
    else if (demoState === "error") setTopError("An account with this email already exists. Try signing in.");
    else { setLoading(false); setTopError(null); }
  }, [demoState]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    const errs = {};
    if (!form.name) errs.name = "Tell us your full name.";
    if (!form.email) errs.email = "Enter your college email.";
    if (!form.password) errs.password = "Pick a password.";
    else if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    if (!form.dept) errs.dept = "Pick your department.";
    if (!form.year) errs.year = "Pick your year.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onSignedIn?.(); }, 700);
  };

  return (
    <div className="auth-page">
      <div className="row gap-2">
        <button className="topbar-back" onClick={onBack} aria-label="Back"><Icon name="back" /></button>
        <div className="t-h2">Create account</div>
      </div>
      <div className="t-small" style={{marginTop:-12}}>Use your college-issued email so your department auto-populates.</div>

      <div className="col gap-4">
        <Field label="Full name" error={errors.name} htmlFor="reg-name">
          <Input id="reg-name" value={form.name} onChange={v => set("name", v)} placeholder="e.g. Ananya Reddy" />
        </Field>
        <Field label="College email" error={errors.email} htmlFor="reg-email">
          <Input id="reg-email" type="email" value={form.email} onChange={v => set("email", v)} placeholder="name@glauniversity.in" inputMode="email" />
        </Field>
        <Field label="Password" helper={errors.password ? null : "Minimum 8 characters."} error={errors.password} htmlFor="reg-pw">
          <Input id="reg-pw" type="password" value={form.password} onChange={v => set("password", v)} placeholder="At least 8 characters" />
        </Field>
        <Field label="Department" error={errors.dept} htmlFor="reg-dept">
          <Select id="reg-dept" value={form.dept} onChange={v => set("dept", v)}
                  options={window.CEMS_DATA.DEPARTMENTS} placeholder="Choose your department" />
        </Field>
        <Field label="Year" error={errors.year} htmlFor="reg-year">
          <Select id="reg-year" value={form.year} onChange={v => set("year", v)}
                  options={window.CEMS_DATA.YEARS.map(y => ({ value: y, label: `Year ${y}` }))} placeholder="Choose your year" />
        </Field>

        {topError ? <Banner kind="danger">{topError}</Banner> : null}

        <Button variant="primary" block loading={loading} onClick={submit}>Create account</Button>
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen, RegisterScreen });
