// Pure side of power: normalisation and formatting, testable without Windows.
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }

export function normalize(raw) {
  return ((raw) => ({
      plan: String(raw.plan ?? "").trim(),
      plans: (raw.plans || []).map((p) => ({ guid: String(p.guid ?? ""), name: String(p.name ?? ""), active: Boolean(p.active) })),
      battery: raw.battery ? { charge: num(raw.battery.charge), status: num(raw.battery.status) } : null,
      sleepAcSeconds: raw.sleepAcSeconds === null || raw.sleepAcSeconds === undefined ? null : num(raw.sleepAcSeconds),
      hibernateAvailable: raw.hibernateAvailable === null || raw.hibernateAvailable === undefined ? null : Boolean(raw.hibernateAvailable),
    }))(raw ?? {});
}

// Dispatch on the shape of the result rather than making the caller say which
// formatter to use: a result carries either `detail`, or `subkeys`, or neither.
export function format(v) {
  const withOk = { ok: true, ...v };
  if (withOk.detail && typeof formatDetail === "function") return formatDetail(withOk);
  if (withOk.subkeys && typeof formatKeys === "function") return formatKeys(withOk);
  return ((v) => {
      const l = [`win_power ok=${v.ok}`];
      if (v.plan) l.push(`  plan: ${v.plan.replace(/^Power Scheme GUID:\s*/, "")}`);
      for (const p of v.plans ?? []) l.push(`  ${p.active ? "*" : " "} ${p.name}  ${p.guid}`);
      if (v.battery) l.push(`  battery: ${v.battery.charge}% (status code ${v.battery.status})`);
      else l.push("  battery: none (desktop or unavailable)");
      if (v.sleepAcSeconds !== null) l.push(`  sleep after: ${v.sleepAcSeconds === 0 ? "never (on AC)" : v.sleepAcSeconds + "s on AC"}`);
      if (v.hibernateAvailable !== null) l.push(`  hibernate: ${v.hibernateAvailable ? "available" : "not available"}`);
      if (v.error) l.push(`error: ${v.error}`);
      return l.join("\n");
    })(withOk);
}

export function parameters() {
  return {
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "all": {
      "type": "boolean",
      "description": "List every power scheme, not just the active one."
    }
  }
};
}

export function outputSchema() {
  return { type: "object", additionalProperties: true };
}
