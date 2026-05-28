import { useEffect, useState } from "react";
import { Button } from "../components/Button.jsx";
import { Field, Input, Select, Chips } from "../components/Form.jsx";
import { Card, Banner, EmptyState, Pill, Avatar, Skeleton } from "../components/Primitives.jsx";
import * as UsersAPI from "../api/users.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useModal } from "../context/ModalContext.jsx";
import { errorMessage } from "../utils/format.js";
import config from "../config.js";

const NEW_STUDENT_FORM = { fullName: "", email: "", password: "", department: config.departments[0] || "", year: "" };

const ROLE_OPTIONS = [
  { value: "STUDENT", label: "Student" },
  { value: "ORGANIZER", label: "Organizer" },
  { value: "ADMIN", label: "Admin" },
];

export function StudentsPage() {
  const { user: me } = useAuth();
  const toast = useToast();
  const { openModal } = useModal();

  const [data, setData] = useState(null);    // { items, total }
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editor, setEditor] = useState(null);  // user being edited
  const [draftRoles, setDraftRoles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newForm, setNewForm] = useState(NEW_STUDENT_FORM);
  const [newErr, setNewErr] = useState(null);

  useEffect(() => { document.title = `People · ${config.appName}`; }, []);

  const load = async (opts = {}) => {
    setData(null);
    setError(null);
    try {
      const res = await UsersAPI.listUsers({
        search: opts.search ?? search,
        role: (opts.role ?? roleFilter) || undefined,
        limit: 100,
      });
      setData(res);
    } catch (e) {
      setError(errorMessage(e, "Couldn't load people."));
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const openEditor = (u) => { setEditor(u); setDraftRoles(u.roles || []); };
  const close = () => { setEditor(null); setDraftRoles([]); };

  const saveRoles = async () => {
    if (!editor) return;
    if (draftRoles.length === 0) { toast.error("Pick at least one role."); return; }
    setBusy(true);
    try {
      const updated = await UsersAPI.setUserRoles(editor._id, draftRoles);
      setData((d) => ({ ...d, items: d.items.map((x) => (x._id === updated._id ? updated : x)) }));
      toast.success("Roles updated.");
      close();
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't update roles."));
    } finally {
      setBusy(false);
    }
  };

  const toggleStatus = async (u) => {
    setBusy(true);
    try {
      const updated = await UsersAPI.setUserStatus(u._id, !(u.isActive !== false));
      setData((d) => ({ ...d, items: d.items.map((x) => (x._id === updated._id ? updated : x)) }));
      toast.success(updated.isActive ? "Account activated." : "Account deactivated.");
      if (editor && editor._id === updated._id) setEditor(updated);
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't change status."));
    } finally {
      setBusy(false);
    }
  };

  const createStudent = async () => {
    setNewErr(null);
    if (!newForm.fullName || newForm.fullName.trim().length < 2) return setNewErr("Name is required.");
    if (!newForm.email) return setNewErr("Email is required.");
    if (!newForm.password || newForm.password.length < 8) return setNewErr("Password must be at least 8 characters.");
    setBusy(true);
    try {
      const created = await UsersAPI.createUser({
        fullName: newForm.fullName.trim(),
        email: newForm.email.trim(),
        password: newForm.password,
        department: newForm.department || undefined,
        year: newForm.year ? Number(newForm.year) : undefined,
        roles: ["STUDENT"],
      });
      setData((d) => ({ ...(d || { total: 0 }), items: [created, ...((d && d.items) || [])], total: (d?.total || 0) + 1 }));
      toast.success("Student account created.");
      setCreating(false);
      setNewForm(NEW_STUDENT_FORM);
    } catch (e) {
      setNewErr(errorMessage(e, "Couldn't create student."));
    } finally {
      setBusy(false);
    }
  };

  const deleteUser = (u) =>
    openModal({
      title: `Remove ${u.fullName}?`,
      body: "This deletes their account and cancels their RSVPs and passes. This can't be undone.",
      primaryLabel: "Remove account",
      primaryVariant: "danger",
      onPrimary: async () => {
        try {
          await UsersAPI.deleteUser(u._id);
          setData((d) => ({ ...d, items: d.items.filter((x) => x._id !== u._id), total: Math.max(0, d.total - 1) }));
          toast.success("Account removed.");
          if (editor && editor._id === u._id) close();
        } catch (e) {
          toast.error(errorMessage(e, "Couldn't remove account."));
        }
      },
    });

  return (
    <div className="col gap-6">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="t-display" style={{ margin: 0 }}>People</h1>
          <div className="t-small">Students, organizers and admins. Manage roles and access.</div>
        </div>
        <Button variant="primary" leadingIcon="plus" onClick={() => setCreating((s) => !s)}>
          {creating ? "Close form" : "New student"}
        </Button>
      </header>

      {creating ? (
        <Card>
          <div className="t-strong">New student account</div>
          {newErr ? <Banner kind="danger">{newErr}</Banner> : null}
          <div className="col gap-3 mt-3">
            <Field label="Full name"><Input value={newForm.fullName} onChange={(v) => setNewForm((f) => ({ ...f, fullName: v }))} placeholder="e.g. Ananya Roy" /></Field>
            <div className="row gap-3">
              <Field label="Email"><Input type="email" value={newForm.email} onChange={(v) => setNewForm((f) => ({ ...f, email: v }))} placeholder="name@glauniversity.in" /></Field>
              <Field label="Temporary password"><Input type="text" value={newForm.password} onChange={(v) => setNewForm((f) => ({ ...f, password: v }))} placeholder="min 8 characters" /></Field>
            </div>
            <div className="row gap-3">
              <Field label="Department"><Select value={newForm.department} onChange={(v) => setNewForm((f) => ({ ...f, department: v }))} options={config.departments} /></Field>
              <Field label="Year"><Select value={newForm.year} onChange={(v) => setNewForm((f) => ({ ...f, year: v }))} options={config.years} placeholder="—" /></Field>
            </div>
            <div className="row gap-2" style={{ justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
              <Button variant="primary" loading={busy} onClick={createStudent}>Create student</Button>
            </div>
          </div>
        </Card>
      ) : null}

      <Card>
        <div className="row gap-3" style={{ alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 240px" }}>
            <div className="t-small" style={{ marginBottom: 6 }}>Search</div>
            <Input
              value={search}
              onChange={setSearch}
              placeholder="Name or email"
            />
          </div>
          <div style={{ width: 180 }}>
            <div className="t-small" style={{ marginBottom: 6 }}>Role</div>
            <Select
              value={roleFilter}
              onChange={(v) => { setRoleFilter(v); load({ role: v }); }}
              options={ROLE_OPTIONS}
              placeholder="All roles"
            />
          </div>
          <Button variant="secondary" onClick={() => load()}>Search</Button>
        </div>
      </Card>

      {error ? (
        <Banner kind="danger">
          {error}{" "}
          <a href="#" style={{ fontWeight: 600 }} onClick={(e) => { e.preventDefault(); load(); }}>Retry</a>
        </Banner>
      ) : null}

      {data === null ? (
        <Card className="card-flush">
          <div className="list">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="row-item">
                <div className="col gap-2" style={{ flex: 1 }}><Skeleton w="40%" h={16} /><Skeleton w="55%" h={12} /></div>
              </div>
            ))}
          </div>
        </Card>
      ) : data.items.length === 0 ? (
        <EmptyState icon="users" title="No people found" body="Try a different search or role filter." />
      ) : (
        <Card className="card-flush">
          <div className="list">
            {data.items.map((u) => (
              <button key={u._id} className="row-item" onClick={() => openEditor(u)}>
                <Avatar name={u.fullName} />
                <div className="col gap-1" style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <div className="row gap-2" style={{ alignItems: "center" }}>
                    <span className="t-strong truncate">{u.fullName}</span>
                    {u.isActive === false ? <Pill status="CANCELLED">Deactivated</Pill> : null}
                  </div>
                  <div className="t-small truncate">{u.email}</div>
                  <div className="t-caption">
                    {(u.roles || []).join(" · ").toLowerCase()}
                    {u.department ? ` · ${u.department}` : ""}{u.year ? ` · Year ${u.year}` : ""}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {editor ? (
        <div className="modal-root" onClick={close}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">{editor.fullName}</div>
            <div className="modal-body">{editor.email}</div>

            <div className="mt-6">
              <div className="t-small" style={{ marginBottom: 6 }}>Roles</div>
              <Chips options={ROLE_OPTIONS} value={draftRoles} onChange={setDraftRoles} />
              {editor._id === me?._id ? (
                <div className="t-caption" style={{ marginTop: 6 }}>This is your own account — you can't remove your admin role.</div>
              ) : null}
            </div>

            <div className="row-between mt-6">
              <div>
                <div className="t-strong">Account status</div>
                <div className="t-small">{editor.isActive === false ? "Deactivated — cannot sign in" : "Active"}</div>
              </div>
              {editor._id === me?._id ? (
                <span className="t-caption">You can't deactivate yourself</span>
              ) : editor.isActive === false ? (
                <Button variant="secondary" loading={busy} onClick={() => toggleStatus(editor)}>Activate</Button>
              ) : (
                <Button variant="danger" loading={busy} onClick={() => toggleStatus(editor)}>Deactivate</Button>
              )}
            </div>

            {editor._id !== me?._id ? (
              <div className="row-between mt-6">
                <div>
                  <div className="t-strong">Remove from college</div>
                  <div className="t-small">Deletes the account, RSVPs and passes.</div>
                </div>
                <Button variant="danger" onClick={() => deleteUser(editor)}>Delete account</Button>
              </div>
            ) : null}

            <div className="modal-actions">
              <Button variant="primary" loading={busy} onClick={saveRoles}>Save roles</Button>
              <Button variant="ghost" onClick={close}>Close</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
