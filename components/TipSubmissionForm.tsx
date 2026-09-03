"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { tipAnalyticsParams, trackTip } from "@/lib/analytics";
import {
  TIP_SUBMISSION_ENDPOINT,
  normalizePublicSourceUrl,
  tipFormBody,
  type TipPlacement,
  type TipSideHint,
} from "@/lib/tip-submission";

type EventOption = { slug: string; title: string; yesLabel: string; noLabel: string };
type FormStatus = "idle" | "submitting" | "success" | "error";
type FieldErrors = Partial<Record<"sourceUrl", string>>;

function placementFrom(raw: string | null): TipPlacement {
  return raw === "event" || raw === "footer" ? raw : "direct";
}

function sideFrom(raw: string | null): TipSideHint | undefined {
  return raw === "yes" || raw === "no" ? raw : undefined;
}

export function TipSubmissionForm({ events }: { events: EventOption[] }) {
  const searchParams = useSearchParams();
  const sourceId = useId();
  const punditId = useId();
  const eventId = useId();
  const whereId = useId();
  const statusId = useId();
  const honeypotId = useId();
  const sourceRef = useRef<HTMLInputElement | null>(null);
  const statusRef = useRef<HTMLElement | null>(null);
  const seenRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);

  const placement = placementFrom(searchParams.get("placement"));
  const eventSlugHint = searchParams.get("event") ?? "";
  const sideHint = sideFrom(searchParams.get("side"));
  const knownEvent = events.find((event) => event.slug === eventSlugHint);
  const initialEvent = knownEvent?.title ?? searchParams.get("eventTitle")?.slice(0, 160) ?? "";
  const sideLabel = sideHint && knownEvent ? (sideHint === "yes" ? knownEvent.yesLabel : knownEvent.noLabel) : undefined;

  const [sourceUrl, setSourceUrl] = useState("");
  const [punditHint, setPunditHint] = useState("");
  const [eventHint, setEventHint] = useState(initialEvent);
  const [timestampHint, setTimestampHint] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  function analytics(errorType?: "validation" | "network" | "provider" | "configuration") {
    return tipAnalyticsParams({
      placement,
      eventSlug: knownEvent?.slug,
      sideHint,
      pagePath: typeof window === "undefined" ? "/submit/" : window.location.pathname,
      errorType,
    });
  }

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
    if (seenRef.current) return;
    seenRef.current = true;
    trackTip("tip_form_view", analytics());
  }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  useEffect(() => {
    if (status === "success") statusRef.current?.focus();
  }, [status]);

  function clearFieldError(field: keyof FieldErrors) {
    if (!errors[field]) return;
    setErrors((current) => ({ ...current, [field]: undefined }));
    if (status === "error") {
      setStatus("idle");
      setMessage("");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const nextErrors: FieldErrors = {};
    if (!normalizePublicSourceUrl(sourceUrl)) {
      nextErrors.sourceUrl = "Enter a public http or https source link.";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setStatus("error");
      setMessage("Check the source link.");
      trackTip("tip_error", analytics("validation"));
      requestAnimationFrame(() => {
        sourceRef.current?.focus();
      });
      return;
    }

    const form = event.currentTarget;
    const trap = (form.elements.namedItem("website") as HTMLInputElement | null)?.value ?? "";
    if (trap) {
      setStatus("success");
      setMessage("Thanks — the source is in the Scout queue.");
      return;
    }

    trackTip("tip_submit", analytics());
    setStatus("submitting");
    setMessage("");
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(TIP_SUBMISSION_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: tipFormBody({
          sourceUrl,
          punditHint,
          eventHint,
          eventSlugHint: knownEvent?.slug,
          sideHint,
          timestampHint,
          placement,
          discovery: "website",
        }).toString(),
        signal: controller.signal,
      });
      if (!response.ok) {
        const errorType = response.status === 400 ? "validation" : response.status === 503 ? "configuration" : "provider";
        trackTip("tip_error", analytics(errorType));
        setStatus("error");
        setMessage("We couldn’t save that source. Please try again.");
        return;
      }
      trackTip("tip_success", analytics());
      setStatus("success");
      setMessage("Thanks — the source is in the Scout queue.");
    } catch (error) {
      if (controller.signal.aborted) return;
      const errorType = error instanceof TypeError ? "network" : "provider";
      trackTip("tip_error", analytics(errorType));
      setStatus("error");
      setMessage("We couldn’t save that source. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <section className="tip-submit-card tip-submit-success" ref={statusRef} tabIndex={-1} role="status">
        <div className="tip-submit-kicker type-broadcast">Tip received</div>
        <h2 className="tip-submit-heading type-broadcast">Scout will verify it.</h2>
        <p>{message}</p>
        <p>
          Every tip still has to clear the same source, quote, mapping, Audit, and Promote checks.
        </p>
        <Link className="tip-submit-back type-broadcast" href={knownEvent ? `/picks/${knownEvent.slug}/` : "/"}>
          {knownEvent ? `Back to ${knownEvent.title}` : "Back to picks"} →
        </Link>
      </section>
    );
  }

  const disabled = status === "submitting";
  return (
    <section className="tip-submit-card">
      {knownEvent ? (
        <p className="tip-submit-context">
          <span className="type-broadcast">For this card</span>
          {knownEvent.title}{sideLabel ? ` · ${sideLabel}` : ""}
        </p>
      ) : null}
      <form className="tip-submit-form" onSubmit={onSubmit} noValidate>
        <div className="tip-submit-field">
          <label htmlFor={sourceId} className="tip-submit-label type-broadcast">
            Public source link <span aria-hidden="true">*</span>
          </label>
          <input
            id={sourceId}
            ref={sourceRef}
            className="tip-submit-input"
            name="sourceUrl"
            type="url"
            inputMode="url"
            autoComplete="url"
            placeholder="https://x.com/... or a public video/article"
            value={sourceUrl}
            required
            disabled={disabled}
            aria-invalid={Boolean(errors.sourceUrl)}
            aria-describedby={errors.sourceUrl ? `${sourceId}-error` : undefined}
            onChange={(event) => {
              setSourceUrl(event.target.value);
              clearFieldError("sourceUrl");
            }}
          />
          {errors.sourceUrl ? <p id={`${sourceId}-error`} className="tip-submit-error">{errors.sourceUrl}</p> : null}
        </div>

        <div className="tip-submit-field">
          <label htmlFor={punditId} className="tip-submit-label type-broadcast">
            Who made the pick? <span className="tip-submit-optional">Optional</span>
          </label>
          <input
            id={punditId}
            className="tip-submit-input"
            name="punditHint"
            type="text"
            autoComplete="off"
            placeholder="George Wrighster"
            value={punditHint}
            disabled={disabled}
            onChange={(event) => setPunditHint(event.target.value)}
          />
        </div>

        <div className="tip-submit-grid">
          <div className="tip-submit-field">
            <label htmlFor={eventId} className="tip-submit-label type-broadcast">
              Game or event <span className="tip-submit-optional">Optional</span>
            </label>
            <input
              id={eventId}
              className="tip-submit-input"
              name="eventHint"
              type="text"
              autoComplete="off"
              placeholder="Clemson at LSU"
              value={eventHint}
              disabled={disabled}
              onChange={(event) => setEventHint(event.target.value)}
            />
          </div>
          <div className="tip-submit-field">
            <label htmlFor={whereId} className="tip-submit-label type-broadcast">
              Where in the source? <span className="tip-submit-optional">Optional</span>
            </label>
            <input
              id={whereId}
              className="tip-submit-input"
              name="timestampHint"
              type="text"
              autoComplete="off"
              placeholder="12:40, final paragraph, or quote cue"
              value={timestampHint}
              disabled={disabled}
              onChange={(event) => setTimestampHint(event.target.value)}
            />
          </div>
        </div>

        <div className="email-interest-honeypot" aria-hidden="true">
          <label htmlFor={honeypotId}>Website</label>
          <input id={honeypotId} type="text" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <button className="tip-submit-button type-broadcast" type="submit" disabled={disabled}>
          {disabled ? "Sending source…" : "Send to Scout"}
        </button>
        <p className="tip-submit-fineprint">
          Only the public source link is required. Add whatever context you have — Scout can sort out the rest. Don’t send private messages, paywalled copies, or personal information. A submission is a lead, not a published pick. See our <Link href="/methodology/">methodology</Link> and <Link href="/privacy/">privacy policy</Link>.
        </p>
        <p id={statusId} className="tip-submit-status" role="status" aria-live="polite">{message}</p>
      </form>
    </section>
  );
}
