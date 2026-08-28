import { describe, expect, it } from "vitest";
import { analyticsParams } from "./analytics";
import {
  EMAIL_SIGNUP_CONSENT_VERSION,
  buildSignupPayload,
  copyForPlacement,
  getEmailSignupConfig,
  isPlausibleEmail,
  normalizeEmail,
  parseSignupFields,
  signupFormBody,
} from "./email-signup";

describe("email signup payload", () => {
  it("trims and lowercases the address for submission", () => {
    expect(normalizeEmail("  Alex@Pundits.PRO ")).toBe("alex@pundits.pro");
    const payload = buildSignupPayload({
      email: "  Alex@Pundits.PRO ",
      placement: "home",
      scope: "all",
      pagePath: "/",
      submittedAt: "2026-08-28T16:00:00.000Z",
    });
    expect(payload.email).toBe("alex@pundits.pro");
    expect(payload.placement).toBe("home");
    expect(payload.scope).toBe("all");
    expect(payload.scopeId).toBe("");
    expect(payload.pagePath).toBe("/");
    expect(payload.consentVersion).toBe(EMAIL_SIGNUP_CONSENT_VERSION);
    expect(payload.submittedAt).toBe("2026-08-28T16:00:00.000Z");
  });

  it("carries placement, scope, page, and consent metadata in the POST body", () => {
    const payload = buildSignupPayload({
      email: "fan@example.com",
      placement: "pundit_profile",
      scope: "pundit",
      scopeId: "kanell",
      pagePath: "/pundits/kanell/",
      submittedAt: "2026-08-28T16:00:00.000Z",
    });
    const body = signupFormBody(payload);
    expect(body.get("email")).toBe("fan@example.com");
    expect(body.get("placement")).toBe("pundit_profile");
    expect(body.get("scope")).toBe("pundit");
    expect(body.get("scopeId")).toBe("kanell");
    expect(body.get("pagePath")).toBe("/pundits/kanell/");
    expect(body.get("consentVersion")).toBe("pick-alerts-early-access-v1");
    expect(body.get("submittedAt")).toBe("2026-08-28T16:00:00.000Z");
  });

  it("never puts email or PII in analytics params", () => {
    const params = analyticsParams({
      placement: "home",
      scope: "all",
      page_path: "/",
      consent_version: EMAIL_SIGNUP_CONSENT_VERSION,
      error_type: "validation",
    });
    expect(params).toEqual({
      placement: "home",
      scope: "all",
      page_path: "/",
      consent_version: EMAIL_SIGNUP_CONSENT_VERSION,
      error_type: "validation",
    });
    expect(JSON.stringify(params)).not.toMatch(/@/);
    expect(params).not.toHaveProperty("email");
  });

  it("keeps the DIY Cloudflare bucket active unless disabled", () => {
    expect(getEmailSignupConfig().active).toBe(true);
    expect(getEmailSignupConfig().endpoint).toBe("/api/email-interest");
    expect(isPlausibleEmail("not-an-email")).toBe(false);
    expect(isPlausibleEmail("fan@example.com")).toBe(true);
  });

  it("treats honeypot fills as spam and rejects junk fields", () => {
    expect(
      parseSignupFields({
        email: "fan@example.com",
        placement: "home",
        scope: "all",
        website: "http://spam",
      }).kind
    ).toBe("spam");
    expect(parseSignupFields({ email: "nope", placement: "home", scope: "all" }).kind).toBe(
      "invalid"
    );
    expect(
      parseSignupFields({
        email: "fan@example.com",
        placement: "home",
        scope: "all",
        pagePath: "/",
      }).kind
    ).toBe("ok");
  });

  it("uses the approved headings", () => {
    expect(copyForPlacement("home").heading).toBe("Get new picks — with the receipt.");
    expect(copyForPlacement("pick_detail").heading).toBe("Get the next verified pick.");
    expect(copyForPlacement("pundit_profile", "Danny Kanell").heading).toBe(
      "Get new Danny Kanell picks."
    );
  });
});
