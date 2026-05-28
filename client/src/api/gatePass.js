// Gate pass: issue, verify, consume.
import { api, requestEnvelope } from "./client.js";

export async function issuePass(eventId) {
  return api.post("/logistics/gate-pass", { eventId });
  // -> { pass, qr }
}

export async function verifyPass(qrPayload) {
  // qrPayload may come from a scanner as a JSON string, or already be the object.
  let qr = qrPayload;
  if (typeof qrPayload === "string") {
    try { qr = JSON.parse(qrPayload); }
    catch {
      return { valid: false, reason: "QR payload is not valid JSON.", pass: null };
    }
  }
  if (!qr) return { valid: false, reason: "Empty QR payload.", pass: null };

  // verify returns success:false with data populated when the pass is invalid —
  // requestEnvelope keeps the data instead of throwing.
  const env = await requestEnvelope("/logistics/gate-pass/verify", {
    method: "POST",
    body: qr,
  });
  return env.data; // { valid, reason, pass }
}

export async function consumePass(passId) {
  return api.post("/logistics/gate-pass/consume", { passId });
}
