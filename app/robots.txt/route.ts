export const dynamic = "force-static";

const ROBOTS = `User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=no, use=reference
Allow: /

Host: https://pundits.pro
Sitemap: https://pundits.pro/sitemap.xml
Sitemap: https://pundits.pro/news-sitemap.xml
`;

export function GET() {
  return new Response(ROBOTS, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
