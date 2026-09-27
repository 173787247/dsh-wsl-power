import { runPowerShell } from "./wsl-host.js";
import { normalize } from "./power.js";

/** The kit's one escaping rule: single-quote the value, doubling any apostrophe. */
function esc(s) {
  return "'" + String(s ?? "").replace(/'/g, "''") + "'";
}

function clamp(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

/**
 * The script is built here, at the call site, the way every other plugin in the
 * kit does it: the PowerShell is written inline and the values are escaped as
 * they are interpolated. An earlier version of this file used a @@TOKEN@@
 * substitution table instead, which needed a template literal that ate the
 * backslashes in a regex and quoted every token twice.
 */
export function script(a) {
  return ((a) => `
$plan = powercfg /getactivescheme 2>$null
$plans = @()
${a.all ? `$plans = @(powercfg /list 2>$null | ForEach-Object {
  $line = "$_".Trim()
  if ($line -match '^Power Scheme GUID:\\s*(\\S+)\\s*\\((.*)\\)\\s*(\\*)?$') {
    @{ guid = $Matches[1]; name = $Matches[2]; active = ($Matches[3] -eq '*') }
  }
})` : ""}
$bat = $null
try {
  $b = Get-CimInstance Win32_Battery -ErrorAction Stop | Select-Object -First 1
  if ($b) { $bat = @{ charge = [int]$b.EstimatedChargeRemaining; status = [int]$b.BatteryStatus } }
} catch {}
$sleep = $null
try {
  $v = (powercfg /query SCHEME_CURRENT SUB_SLEEP STANDBYIDLE 2>$null | Select-String 'Current AC Power Setting Index' | Select-Object -First 1)
  if ($v) { $sleep = [Convert]::ToInt32(($v -split ':')[-1].Trim(), 16) }
} catch {}
$hib = $null
try { $hib = ((powercfg /a 2>$null) -join ' ') -match 'Hibernate' } catch {}
ConvertTo-Json -Compress -Depth 4 @{ plan = "$plan"; plans = @($plans); battery = $bat; sleepAcSeconds = $sleep; hibernateAvailable = $hib }`)(a);
}

export async function execute(args, config = {}) {
  const a = {
    name: typeof args?.name === "string" ? args.name : "",
    state: typeof args?.state === "string" ? args.state : "",
    log: typeof args?.log === "string" ? args.log : "System",
    path: typeof args?.path === "string" ? args.path : "",
    provider: typeof args?.provider === "string" ? args.provider : "",
    level: clamp(args?.level, 1, 5, 2),
    count: clamp(args?.count, 1, 200, 20),
    limit: clamp(args?.limit, 1, 400, 40),
    top: clamp(args?.top, 1, 40, 8),
    detail: Boolean(args?.detail),
    subkeys: Boolean(args?.subkeys),
    all: Boolean(args?.all),
    full: Boolean(args?.full),
    since: null,
  };



  const timeoutMs = clamp(config.timeoutMs, 1000, 120000, 30000);
  const { stdout } = await runPowerShell(script(a), { timeoutMs });
  const raw = JSON.parse(stdout.trim() || "{}");
  if (raw.error) return { ok: false, error: String(raw.error) };
  return { ok: true, ...normalize(raw) };
}
