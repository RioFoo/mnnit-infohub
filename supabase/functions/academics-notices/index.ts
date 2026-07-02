// Scrapes MNNIT Dean Academic notice board (https://academics.mnnit.ac.in/new/)
// Returns a JSON list of notices, publicly cacheable.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const SOURCE_URL = "https://academics.mnnit.ac.in/new/";
const BASE = "https://academics.mnnit.ac.in";

interface Notice {
  id: string;
  title: string;
  date: string;
  link: string | null;
  body: string;
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function parseNotices(html: string): Notice[] {
  const notices: Notice[] = [];
  // Each notice block starts with panel-heading referring to notif-collapse-<id>
  const headingRe =
    /href="#notif-collapse-(\d+)"[\s\S]*?<div class="col-md-8"[^>]*>([\s\S]*?)<\/div>[\s\S]*?<div class="col-md-4"[^>]*>([\s\S]*?)<span/g;
  const bodyRe = /id="notif-collapse-(\d+)"[\s\S]*?<div class="panel-body"[^>]*>([\s\S]*?)<\/div>/g;

  const bodies = new Map<string, string>();
  let bm: RegExpExecArray | null;
  while ((bm = bodyRe.exec(html))) {
    bodies.set(bm[1], bm[2]);
  }

  let m: RegExpExecArray | null;
  while ((m = headingRe.exec(html))) {
    const id = m[1];
    const title = stripTags(m[2]);
    const date = stripTags(m[3]);
    const bodyRaw = bodies.get(id) ?? "";
    const linkMatch = bodyRaw.match(/href=["']?([^"'\s>]+)["']?/i);
    let link: string | null = linkMatch ? linkMatch[1] : null;
    if (link && link.startsWith("/")) link = BASE + link;
    notices.push({ id, title, date, link, body: stripTags(bodyRaw) });
  }
  return notices;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const res = await fetch(SOURCE_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (MNNIT-InfoHub)" },
    });
    if (!res.ok) throw new Error(`Upstream ${res.status}`);
    const html = await res.text();
    const notices = parseNotices(html);

    return new Response(
      JSON.stringify({ source: SOURCE_URL, fetchedAt: new Date().toISOString(), count: notices.length, notices }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=180, s-maxage=180",
        },
      },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
