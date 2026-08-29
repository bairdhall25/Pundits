import { loadCalls, loadEvents, loadPundits } from "@/lib/data";
import { rssFeed } from "@/lib/feeds";

export const dynamic = "force-static";

export function GET() {
  return new Response(rssFeed(loadCalls(), loadEvents(), loadPundits()), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
