import type { Metadata } from "next";
import { loadCalls, loadEvents, loadPundits } from "../data";
import { ogImageFor } from "../og";
import { pageMeta } from "../site";
import { ogPagePath, socialPageRoute } from "./registry";
import { resolvePageSocialCard, type SocialPageKey } from "./resolver";

export function socialPageModel(key: SocialPageKey) {
  return resolvePageSocialCard(key, "landscape", {
    events: loadEvents(),
    calls: loadCalls(),
    pundits: loadPundits(),
  });
}

export function socialPageImage(key: SocialPageKey, alt: string) {
  const model = socialPageModel(key);
  return ogImageFor(ogPagePath(key), alt, model);
}

export function socialPageMeta(
  key: SocialPageKey,
  title: string,
  description: string
): Metadata {
  return pageMeta(
    title,
    description,
    socialPageRoute(key),
    socialPageImage(key, title)
  );
}
