import type { SocialCardModel } from "../../lib/social-card";
import { EmptyEventCard } from "./editorial";
import { QuoteCard } from "./quote";
import { SplitCard } from "./split";

export function landscapeSocialTree(model: SocialCardModel) {
  if (model.archetype === "split") return <SplitCard model={model} />;
  if (model.archetype === "quote") return <QuoteCard model={model} />;
  if (model.mode === "event-empty") return <EmptyEventCard model={model} />;
  throw new Error(`Landscape renderer not implemented for editorial mode ${model.mode}`);
}
