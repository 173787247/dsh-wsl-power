import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalize, format, parameters } from "../lib/power.js";

describe("power", () => {
  it("trims the plan string", () => {
    assert.equal(normalize({ plan: "  abc  " }).plan, "abc");
  });
  it("keeps battery null on a desktop", () => {
    assert.equal(normalize({}).battery, null);
  });
  it("keeps sleepAcSeconds null when the query failed", () => {
    assert.equal(normalize({}).sleepAcSeconds, null);
  });
  it("describes a zero standby timeout as never", () => {
    const out = format(normalize({ sleepAcSeconds: 0 }));
    assert.ok(out.includes("never (on AC)"), out);
  });
  it("describes a non-zero standby timeout in seconds", () => {
    const out = format(normalize({ sleepAcSeconds: 900 }));
    assert.ok(out.includes("900s on AC"), out);
  });
  it("says there is no battery rather than showing 0%", () => {
    const out = format(normalize({}));
    assert.ok(out.includes("battery: none"), out);
  });
  it("reports a battery when one is present", () => {
    const out = format(normalize({ battery: { charge: 80, status: 1 } }));
    assert.ok(out.includes("battery: 80%"), out);
  });
  it("declares no additional properties", () => {
    assert.equal(parameters().additionalProperties, false);
  });
});
