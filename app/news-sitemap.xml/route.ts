import { loadCalls, loadEvents, loadPundits } from "@/lib/data";
import { newsSitemap } from "@/lib/feeds";

export const dynamic = "force-static";

export function GET() {
  return new Response(newsSitemap(loadCalls(), loadEvents(), loadPundits()), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
