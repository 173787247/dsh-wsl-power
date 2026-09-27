import { detectWsl } from "./lib/wsl-host.js";
import * as core from "./lib/power.js";
import { execute } from "./lib/power-exec.js";

export const name = "dsh-wsl-power";
export const inject = ["tools", "systemPrompt"];

export function apply(ctx, config = {}) {
  const wsl = detectWsl();

  ctx.systemPrompt.section({
    name: "tool:win_power",
    order: 219,
    text: "Use win_power for WSL/Windows interop: Windows power state from WSL: active power plan, battery status and sleep settings.",
  });

  ctx.tools.register({
    name: "win_power",
    description: "Windows power state from WSL: active power plan, battery status and sleep settings.",
    parameters: core.parameters(),
    output: {
      schema: core.outputSchema(),
      render: (_args, value) => [{ type: "text", text: core.format(value) }],
    },
    timeoutMs: Number(config.timeoutMs) > 0 ? Number(config.timeoutMs) : 30_000,
    isConcurrencySafe: () => true,
    async execute(args) {
      if (!wsl) return { ok: false, error: "not running in WSL" };
      try {
        return await execute(args, config);
      } catch (error) {
        return { ok: false, error: String(error?.message ?? error) };
      }
    },
    presentCall: () => ({ card: "generic", title: "win_power" }),
    presentResult: (_args, result) => ({ card: "generic", title: "win_power", content: result?.content }),
  });
}
