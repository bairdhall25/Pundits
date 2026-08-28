import { describe, expect, it } from "vitest";
import { buildNotifyMime, notifySubject } from "./email-notify";
import { buildSignupPayload } from "./email-signup";

const payload = buildSignupPayload({
  email: "fan@example.com",
  placement: "pick_detail",
  scope: "event",
  scopeId: "clemson-at-lsu-2026",
  pagePath: "/picks/clemson-at-lsu-2026/",
  submittedAt: "2026-08-28T16:00:00.000Z",
});

describe("signup notification email", () => {
  it("names the placement in the subject", () => {
    expect(notifySubject(payload)).toBe("New early-list signup · pick_detail");
  });

  it("builds a plain-text MIME message with CRLF line endings", () => {
    const mime = buildNotifyMime(payload, {
      from: "alerts@pundits.pro",
      to: "owner@gmail.com",
    });
    const [head] = mime.split("\r\n\r\n");
    expect(head).toContain("From: Pundits <alerts@pundits.pro>");
    expect(head).toContain("To: owner@gmail.com");
    expect(head).toContain("Subject: New early-list signup · pick_detail");
    expect(head).toContain("Content-Type: text/plain; charset=utf-8");
    expect(head).toContain("MIME-Version: 1.0");
    // every newline in the message is CRLF
    expect(mime.replace(/\r\n/g, "")).not.toMatch(/[\r\n]/);
  });

  it("carries the signup details in the body", () => {
    const mime = buildNotifyMime(payload, {
      from: "alerts@pundits.pro",
      to: "owner@gmail.com",
    });
    const body = mime.split("\r\n\r\n").slice(1).join("\r\n\r\n");
    expect(body).toContain("fan@example.com");
    expect(body).toContain("pick_detail");
    expect(body).toContain("event · clemson-at-lsu-2026");
    expect(body).toContain("/picks/clemson-at-lsu-2026/");
    expect(body).toContain("2026-08-28T16:00:00.000Z");
  });

  it("strips header-breaking characters from injected values", () => {
    const mime = buildNotifyMime(
      { ...payload, pagePath: "/x\r\nBcc: evil@example.com" },
      { from: "alerts@pundits.pro", to: "owner@gmail.com" }
    );
    // injected CRLF must not survive as a line break anywhere
    expect(mime).not.toContain("\r\nBcc:");
    expect(mime).toContain("Page: /x Bcc: evil@example.com");
  });
});
