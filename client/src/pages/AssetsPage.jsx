import { useEffect, useState } from "react";
import { Button, IconButton } from "../components/Button.jsx";
import { Field, Input, Select } from "../components/Form.jsx";
import { Card, Banner, EmptyState, Progress, Skeleton } from "../components/Primitives.jsx";
import { Icon } from "../components/Icon.jsx";
import * as AssetsAPI from "../api/assets.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { errorMessage } from "../utils/format.js";
import config from "../config.js";

export function AssetsPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();

  const [assets, setAssets] = useState(null);
  const [error, setError] = useState(null);
  const [editor, setEditor] = useState(null); // selected asset for reserve/release sheet
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", category: config.assetCategories[0], totalQuantity: "", notes: "" });
  const [createErr, setCreateErr] = useState(null);

  useEffect(() => { document.title = `Assets · ${config.appName}`; }, []);

  const load = async () => {
    setAssets(null);
    setError(null);
    try {
      const items = await AssetsAPI.listAssets();
      setAssets(items);
    } catch (e) {
      setError(errorMessage(e, "Couldn't load assets."));
    }
  };

  useEffect(() => { load(); }, []);

  const openEditor = (a) => { setEditor(a); setQty(1); };

  const reserve = async () => {
    if (!editor) return;
    setBusy(true);
    try {
      const updated = await AssetsAPI.reserveAsset(editor._id, qty);
      setAssets((arr) => arr.map((x) => (x._id === updated._id ? updated : x)));
      toast.success(`Reserved ${qty} × ${editor.name}.`);
      setEditor(null);
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't reserve."));
    } finally {
      setBusy(false);
    }
  };

  const release = async () => {
    if (!editor) return;
    setBusy(true);
    try {
      const updated = await AssetsAPI.releaseAsset(editor._id, qty);
      setAssets((arr) => arr.map((x) => (x._id === updated._id ? updated : x)));
      toast.success(`Released ${qty} × ${editor.name}.`);
      setEditor(null);
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't release."));
    } finally {
      setBusy(false);
    }
  };

  const create = async () => {
    setCreateErr(null);
    if (!createForm.name || !createForm.totalQuantity || Number(createForm.totalQuantity) < 0) {
      setCreateErr("Name and total quantity are required.");
      return;
    }
    setBusy(true);
    try {
      const created = await AssetsAPI.createAsset({
        name: createForm.name.trim(),
        category: createForm.category,
        totalQuantity: Number(createForm.totalQuantity),
        notes: createForm.notes || undefined,
      });
      setAssets((arr) => [created, ...(arr || [])]);
      toast.success("Asset added.");
      setCreating(false);
      setCreateForm({ name: "", category: config.assetCategories[0], totalQuantity: "", notes: "" });
    } catch (e) {
      setCreateErr(errorMessage(e, "Couldn't create asset."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="col gap-6">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="t-display" style={{ margin: 0 }}>Assets</h1>
          <div className="t-small">Shared event inventory. Reserve or release units below.</div>
        </div>
        {isAdmin ? (
          <Button variant="primary" leadingIcon="plus" onClick={() => setCreating((s) => !s)}>
            {creating ? "Close form" : "New asset"}
          </Button>
        ) : null}
      </header>

      {creating ? (
        <Card>
          <div className="t-strong">New asset</div>
          {createErr ? <Banner kind="danger">{createErr}</Banner> : null}
          <div className="col gap-3 mt-3">
            <Field label="Name"><Input value={createForm.name} onChange={(v) => setCreateForm((f) => ({ ...f, name: v }))} placeholder="e.g. Wireless Mics" /></Field>
            <div className="row gap-3">
              <Field label="Category">
                <Select value={createForm.category} onChange={(v) => setCreateForm((f) => ({ ...f, category: v }))} options={config.assetCategories} />
              </Field>
              <Field label="Total quantity"><Input type="number" inputMode="numeric" value={createForm.totalQuantity} onChange={(v) => setCreateForm((f) => ({ ...f, totalQuantity: v }))} placeholder="0" /></Field>
            </div>
            <Field label="Notes (optional)"><Input value={createForm.notes} onChange={(v) => setCreateForm((f) => ({ ...f, notes: v }))} placeholder="e.g. Stored in AV cupboard" /></Field>
            <div className="row gap-2" style={{ justifyContent: "flex-end" }}>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button>
              <Button variant="primary" loading={busy} onClick={create}>Create asset</Button>
            </div>
          </div>
        </Card>
      ) : null}

      {error ? (
        <Banner kind="danger">
          {error}{" "}
          <a href="#" style={{ fontWeight: 600 }} onClick={(e) => { e.preventDefault(); load(); }}>Retry</a>
        </Banner>
      ) : null}

      {assets === null ? (
        <Card className="card-flush">
          <div className="list">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="row-item">
                <div className="col gap-2" style={{ flex: 1 }}><Skeleton w="40%" h={12} /><Skeleton w="60%" h={16} /><Skeleton w="50%" h={12} /></div>
              </div>
            ))}
          </div>
        </Card>
      ) : assets.length === 0 ? (
        <EmptyState icon="package" title="No assets yet" body={isAdmin ? "Create one to get started." : "Ask an admin to add inventory."} />
      ) : (
        <Card className="card-flush">
          <div className="list">
            {assets.map((a) => (
              <button key={a._id} className="row-item" onClick={() => openEditor(a)}>
                <div className="col gap-1" style={{ flex: 1, minWidth: 0 }}>
                  <div className="t-caption">{a.category}</div>
                  <div className="t-strong">{a.name}</div>
                  <div className="t-small">{a.availableQuantity} of {a.totalQuantity} available</div>
                  <div style={{ maxWidth: 220 }}>
                    <Progress value={a.availableQuantity} max={a.totalQuantity || 1} />
                  </div>
                </div>
                <Icon name="chevron-right" color="var(--color-text-secondary)" />
              </button>
            ))}
          </div>
        </Card>
      )}

      {editor ? (
        <div className="modal-root" onClick={() => setEditor(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">{editor.name}</div>
            <div className="modal-body">{editor.availableQuantity} of {editor.totalQuantity} available · {editor.category}</div>
            <div className="row-between mt-6">
              <div className="t-strong">Quantity</div>
              <div className="row gap-2">
                <IconButton icon="minus" label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))} />
                <div className="t-strong" style={{ minWidth: 24, textAlign: "center" }}>{qty}</div>
                <IconButton icon="plus" label="Increase" onClick={() => setQty((q) => Math.min((editor.totalQuantity || 999), q + 1))} />
              </div>
            </div>
            <div className="modal-actions">
              <Button variant="primary" loading={busy} onClick={reserve} disabled={qty > editor.availableQuantity}>
                Reserve
              </Button>
              <Button variant="secondary" loading={busy} onClick={release} disabled={editor.availableQuantity >= editor.totalQuantity}>
                Release
              </Button>
              <Button variant="ghost" onClick={() => setEditor(null)}>Close</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
