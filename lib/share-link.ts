import { canonicalUrl } from "./site";

export type SharePayload = {
  title: string;
  text: string;
  url: string;
  image: string;
  story: string;
  tweetHref: string;
};

export function tweetIntent(text: string, url: string): string {
  const params = new URLSearchParams({ text, url });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function sharePayload(input: {
  title: string;
  text: string;
  path: string;
  image: string;
  story: string;
}): SharePayload {
  const url = canonicalUrl(input.path);
  return {
    title: input.title,
    text: input.text,
    url,
    image: input.image,
    story: input.story,
    tweetHref: tweetIntent(input.text, url),
  };
}
