// Pure side of dsh-wsl-power: normalisation and formatting, testable without Windows.
function num(v) { const n = Number(v); return Number.isFinite(n) ? n : 0; }

export function normalize(raw) {
  return ((raw) => ({
      plan: String(raw.plan ?? "").trim(),
      battery: raw.battery ? { charge: num(raw.battery.charge), status: num(raw.battery.status) } : null,
      sleepAcSeconds: raw.sleepAcSeconds === null || raw.sleepAcSeconds === undefined ? null : num(raw.sleepAcSeconds),
    }))(raw ?? {});
}

export function format(v) {
  return ((v) => {
      const l = [`win_power ok=${v.ok}`];
      if (v.plan) l.push(`  plan: ${v.plan.replace(/^Power Scheme GUID:\s*/, "")}`);
      if (v.battery) l.push(`  battery: ${v.battery.charge}% (status code ${v.battery.status})`);
      else l.push("  battery: none (desktop or unavailable)");
      if (v.sleepAcSeconds !== null) l.push(`  sleep after: ${v.sleepAcSeconds === 0 ? "never (on AC)" : v.sleepAcSeconds + "s on AC"}`);
      if (v.error) l.push(`error: ${v.error}`);
      return l.join("\n");
    })({ ok: true, ...v });
}

export function parameters() {
  return {
  "type": "object",
  "additionalProperties": false,
  "properties": {}
};
}

export function outputSchema() {
  return { type: "object", additionalProperties: true };
}
