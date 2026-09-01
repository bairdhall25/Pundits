"use client";

import { useEffect, useId, useRef, useState } from "react";
import { shareIntentParams, trackEvent } from "@/lib/analytics";
import type { SharePayload } from "@/lib/share-link";

function fileName(path: string): string {
  return path.split("/").filter(Boolean).join("-");
}

function save(path: string) {
  const a = document.createElement("a");
  a.href = path;
  a.download = fileName(path);
  a.rel = "noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function ShareButton({
  share,
  compact = false,
}: {
  share: SharePayload;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const menuId = useId();

  function trackShareIntent() {
    if (!share.eventSlug) return;
    trackEvent(
      "share_intent",
      shareIntentParams({
        artifactType: share.artifactType ?? "take",
        eventSlug: share.eventSlug,
        punditId: share.punditId,
        status: share.status,
      })
    );
  }

  useEffect(() => {
    if (!open) return;
    function onDoc(event: MouseEvent) {
      if (root.current && !root.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function copyLink(track = true) {
    if (track) trackShareIntent();
    try {
      await navigator.clipboard.writeText(share.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copy this link", share.url);
    }
  }

  async function nativeShare() {
    trackShareIntent();
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: share.title, text: share.text, url: share.url });
        setOpen(false);
        return;
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
      }
    }
    await copyLink(false);
  }

  return (
    <div className={`share ${compact ? "share-compact" : ""}`} ref={root}>
      <button
        type="button"
        className="share-toggle"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
      >
        Share
      </button>
      {open ? (
        <div className="share-sheet" id={menuId} role="menu">
          <button type="button" role="menuitem" onClick={() => void nativeShare()}>
            Share
          </button>
          <button type="button" role="menuitem" onClick={() => void copyLink()}>
            {copied ? "Copied" : "Copy link"}
          </button>
          <a
            role="menuitem"
            href={share.tweetHref}
            target="_blank"
            rel="noreferrer"
            onClick={trackShareIntent}
          >
            Post to X
          </a>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              trackShareIntent();
              save(share.image);
            }}
          >
            Save image
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              trackShareIntent();
              save(share.story);
            }}
          >
            Save story
          </button>
        </div>
      ) : null}
    </div>
  );
}
