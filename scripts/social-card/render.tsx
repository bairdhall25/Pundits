import type { SocialCardModel } from "../../lib/social-card";
import { EditorialCard } from "./editorial";
import { QuoteCard } from "./quote";
import { SplitCard } from "./split";

export function landscapeSocialTree(model: SocialCardModel) {
  if (model.archetype === "split") return <SplitCard model={model} />;
  if (model.archetype === "quote") return <QuoteCard model={model} />;
  return <EditorialCard model={model} />;
}
