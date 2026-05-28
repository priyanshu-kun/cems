import { useEffect, useState } from "react";
import { Button } from "../components/Button.jsx";
import { Input, Select, Chips } from "../components/Form.jsx";
import { Card, Banner, EmptyState, Pill, Avatar, Skeleton } from "../components/Primitives.jsx";
import * as UsersAPI from "../api/users.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { errorMessage } from "../utils/format.js";
import config from "../config.js";

const ROLE_OPTIONS = [
  { value: "STUDENT", label: "Student" },
  { value: "ORGANIZER", label: "Organizer" },
  { value: "ADMIN", label: "Admin" },
];

export function StudentsPage() {
  const { user: me } = useAuth();
  const toast = useToast();

  const [data, setData] = useState(null);    // { items, total }
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editor, setEditor] = useState(null);  // user being edited
  const [draftRoles, setDraftRoles] = useState([]);
  const [busy, setBusy] = useState(false);

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

  return (
    <div className="col gap-6">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="t-display" style={{ margin: 0 }}>People</h1>
          <div className="t-small">Students, organizers and admins. Manage roles and access.</div>
        </div>
      </header>

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
