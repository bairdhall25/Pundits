import type { SocialPageKey } from "./resolver";

export type SocialPageRegistration = {
  route: string;
  image: `/og/pages/${string}.png`;
};

export const SOCIAL_PAGE_REGISTRY = {
  home: { route: "/", image: "/og/pages/home.png" },
  stories: { route: "/stories", image: "/og/pages/stories.png" },
  book: { route: "/book", image: "/og/pages/book.png" },
  leaderboard: { route: "/leaderboard", image: "/og/pages/leaderboard.png" },
  ncaaf: { route: "/ncaaf", image: "/og/pages/ncaaf.png" },
  nfl: { route: "/nfl", image: "/og/pages/nfl.png" },
  submit: { route: "/submit", image: "/og/pages/submit.png" },
  about: { route: "/about", image: "/og/pages/about.png" },
  methodology: { route: "/methodology", image: "/og/pages/methodology.png" },
  privacy: { route: "/privacy", image: "/og/pages/privacy.png" },
  terms: { route: "/terms", image: "/og/pages/terms.png" },
} as const satisfies Record<SocialPageKey, SocialPageRegistration>;

export const SOCIAL_PAGE_KEYS = Object.freeze(
  Object.keys(SOCIAL_PAGE_REGISTRY) as SocialPageKey[]
);

export function ogPagePath(key: SocialPageKey): string {
  return SOCIAL_PAGE_REGISTRY[key].image;
}

export function socialPageRoute(key: SocialPageKey): string {
  return SOCIAL_PAGE_REGISTRY[key].route;
}
