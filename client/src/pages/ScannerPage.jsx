import { useState } from "react";
import { useEffect } from "react";
import { Button } from "../components/Button.jsx";
import { Field, Textarea } from "../components/Form.jsx";
import { Banner, Card } from "../components/Primitives.jsx";
import { Icon } from "../components/Icon.jsx";
import * as GatePassAPI from "../api/gatePass.js";
import { useToast } from "../context/ToastContext.jsx";
import { errorMessage } from "../utils/format.js";
import config from "../config.js";

export function ScannerPage() {
  const toast = useToast();
  const [payload, setPayload] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [consuming, setConsuming] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => { document.title = `Scanner · ${config.appName}`; }, []);

  const verify = async () => {
    const p = payload.trim();
    if (!p) { toast.error("Paste a QR payload first."); return; }
    setVerifying(true);
    setResult(null);
    try {
      const data = await GatePassAPI.verifyPass(p);
      setResult(data);
    } catch (e) {
      toast.error(errorMessage(e, "Verification failed."));
    } finally {
      setVerifying(false);
    }
  };

  const consume = async () => {
    if (!result?.pass?.passId) return;
    setConsuming(true);
    try {
      await GatePassAPI.consumePass(result.pass.passId);
      toast.success("Pass marked as used.");
      reset();
    } catch (e) {
      toast.error(errorMessage(e, "Couldn't consume pass."));
    } finally {
      setConsuming(false);
    }
  };

  const reset = () => { setPayload(""); setResult(null); };

  // ---- Result screens ----
  if (result) {
    if (result.valid) {
      const consumed = result.pass?.status === "CONSUMED";
      return (
        <ResultScreen
          kind={consumed ? "warning" : "success"}
          icon={consumed ? "alert" : "check"}
          title={consumed ? "Already used" : "Pass is valid"}
          message={consumed ? "This pass has already been scanned in." : (result.reason || "Welcome.")}
          extras={
            result.pass ? (
              <div className="col gap-1" style={{ alignItems: "center" }}>
                {result.holder ? (
                  <>
                    <div className="t-strong">{result.holder.name}</div>
                    <div className="t-small">{result.holder.type === "GUEST" ? "Guest" : "Student"}{result.holder.detail ? ` · ${result.holder.detail}` : ""}</div>
                  </>
                ) : null}
                <div className="t-caption" style={{ fontFamily: "ui-monospace, monospace", textTransform: "none" }}>
                  {result.pass.passId}
                </div>
              </div>
            ) : null
          }
          actions={
            <>
              {!consumed && result.pass?.passId ? (
                <Button variant="primary" loading={consuming} onClick={consume}>Mark as used</Button>
              ) : null}
              <Button variant={consumed ? "primary" : "ghost"} onClick={reset}>Scan another</Button>
            </>
          }
        />
      );
    }
    return (
      <ResultScreen
        kind="danger"
        icon="x"
        title="Pass is invalid"
        message={result.reason || "This pass could not be verified."}
        actions={<Button variant="primary" onClick={reset}>Scan another</Button>}
      />
    );
  }

  return (
    <div className="col gap-6">
      <header className="page-header">
        <div className="page-header-text">
          <h1 className="t-display" style={{ margin: 0 }}>Scanner</h1>
          <div className="t-small">Verify a gate pass at the door.</div>
        </div>
      </header>

      <Card>
        <Field
          label="QR payload (JSON)"
          helper="Paste the JSON from a scanned QR code. Your scanner can call /logistics/gate-pass/verify directly for a true camera flow."
        >
          <Textarea
            value={payload}
            onChange={setPayload}
            rows={6}
            style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13 }}
            placeholder='{"v":1,"passId":"…","eventId":"…","holderType":"STUDENT","holderId":"…","issuedAt":"…","expiresAt":"…","sig":"…"}'
          />
        </Field>
        <Banner kind="info">
          The verify endpoint returns 200 with <code>success: false</code> when a pass fails its checks — those failures are shown inline, not as errors.
        </Banner>
        <div className="row gap-2 mt-3" style={{ justifyContent: "flex-end" }}>
          <Button variant="ghost" onClick={() => setPayload("")}>Clear</Button>
          <Button variant="primary" leadingIcon="scan" loading={verifying} onClick={verify}>Verify pass</Button>
        </div>
      </Card>
    </div>
  );
}

function ResultScreen({ kind, icon, title, message, extras, actions }) {
  return (
    <div className="col gap-4">
      <div className="scanner-result">
        <div className={`icon-circle ${kind}`}><Icon name={icon} /></div>
        <h1 className="t-display" style={{ margin: 0, color: kind === "success" ? "var(--color-success)" : kind === "danger" ? "var(--color-danger)" : "var(--color-warning)" }}>
          {title}
        </h1>
        <div className="t-body" style={{ maxWidth: 420, textWrap: "pretty" }}>{message}</div>
        {extras}
        <div className="row gap-2" style={{ marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>
          {actions}
        </div>
      </div>
    </div>
  );
}
