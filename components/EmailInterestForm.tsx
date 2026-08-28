"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { trackEmailInterest } from "@/lib/analytics";
import {
  EMAIL_SIGNUP_CONSENT_VERSION,
  buildSignupPayload,
  copyForPlacement,
  getEmailSignupConfig,
  isPlausibleEmail,
  signupFormBody,
  type EmailSignupPlacement,
  type EmailSignupScope,
} from "@/lib/email-signup";

type EmailInterestFormProps = {
  placement: EmailSignupPlacement;
  scope: EmailSignupScope;
  scopeId?: string;
  subjectName?: string;
  /** "panel" is the full boxed form; "band" is the slimmer inline strip. */
  variant?: "panel" | "band";
};

type FormStatus = "idle" | "submitting" | "success" | "error";

export function EmailInterestForm({
  placement,
  scope,
  scopeId,
  subjectName,
  variant = "panel",
}: EmailInterestFormProps) {
  const copy = copyForPlacement(placement, subjectName);
  const config = getEmailSignupConfig();
  const inputId = useId();
  const statusId = useId();
  const honeypotId = useId();
  const rootRef = useRef<HTMLElement | null>(null);
  const seenRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  function context() {
    const page_path = typeof window === "undefined" ? "/" : window.location.pathname;
    return {
      placement,
      scope,
      scope_id: scopeId,
      page_path,
      consent_version: EMAIL_SIGNUP_CONSENT_VERSION,
    };
  }

  useEffect(() => {
    const node = rootRef.current;
    if (!node || seenRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (seenRef.current) return;
        if (entries.some((entry) => entry.isIntersecting)) {
          seenRef.current = true;
          trackEmailInterest("email_interest_view", context());
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    const normalized = email.trim();
    if (!config.active) {
      trackEmailInterest("email_interest_error", { ...context(), error_type: "configuration" });
      setStatus("error");
      setMessage("Email signup is temporarily unavailable.");
      return;
    }
    if (!isPlausibleEmail(normalized)) {
      trackEmailInterest("email_interest_error", { ...context(), error_type: "validation" });
      setStatus("error");
      setMessage("Enter a valid email address.");
      return;
    }

    const form = event.currentTarget;
    const trap = (form.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    if (trap) {
      setStatus("success");
      setMessage("You’re on the list.");
      return;
    }

    trackEmailInterest("email_interest_submit", context());
    setStatus("submitting");
    setMessage("");
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const payload = buildSignupPayload({
      email: normalized,
      placement,
      scope,
      scopeId,
      pagePath: context().page_path,
    });

    try {
      const response = await fetch(config.endpoint, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: signupFormBody(payload).toString(),
        signal: controller.signal,
      });
      if (!response.ok) {
        trackEmailInterest("email_interest_error", { ...context(), error_type: "provider" });
        setStatus("error");
        setMessage("We couldn’t save your email. Try again.");
        return;
      }
      trackEmailInterest("email_interest_success", context());
      setStatus("success");
      setMessage("You’re on the list.");
    } catch (err) {
      if (controller.signal.aborted) return;
      const network = err instanceof TypeError;
      trackEmailInterest("email_interest_error", {
        ...context(),
        error_type: network ? "network" : "provider",
      });
      setStatus("error");
      setMessage("We couldn’t save your email. Try again.");
    }
  }

  const disabled = !config.active || status === "submitting";

  return (
    <section
      ref={rootRef}
      className={`email-interest${variant === "band" ? " email-interest-band" : ""}`}
      data-placement={placement}
    >
      <div className="email-interest-kicker type-broadcast">{copy.kicker}</div>
      <h2 className="email-interest-heading type-broadcast">{copy.heading}</h2>
      <p className="email-interest-body">{copy.body}</p>
      {status === "success" ? (
        <div className="email-interest-success" role="status">
          <p className="email-interest-success-title">You’re on the list.</p>
          <p>Pick alerts are not live yet—we’ll email you when they’re ready.</p>
        </div>
      ) : !config.active ? (
        <p className="email-interest-unavailable" role="status">
          Email signup is temporarily unavailable.{" "}
          <a href="/privacy/">Privacy</a>
        </p>
      ) : (
        <form className="email-interest-form" onSubmit={onSubmit} noValidate>
          <label className="email-interest-label" htmlFor={inputId}>
            Email address
          </label>
          <div className="email-interest-row">
            <input
              id={inputId}
              className="email-interest-input"
              type="email"
              name="email"
              required
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              disabled={disabled}
              aria-describedby={statusId}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") {
                  setStatus("idle");
                  setMessage("");
                }
              }}
            />
            <button className="email-interest-submit" type="submit" disabled={disabled}>
              {status === "submitting" ? "Joining…" : copy.button}
            </button>
          </div>
          <div className="email-interest-honeypot" aria-hidden="true">
            <label htmlFor={honeypotId}>Website</label>
            <input
              id={honeypotId}
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <p className="email-interest-consent">
            We’ll only use this address for Pundits pick-alert updates. Unsubscribe anytime.{" "}
            <a href="/privacy/">Privacy</a>
          </p>
          <p id={statusId} className="email-interest-status" role="status" aria-live="polite">
            {message}
          </p>
        </form>
      )}
    </section>
  );
}
