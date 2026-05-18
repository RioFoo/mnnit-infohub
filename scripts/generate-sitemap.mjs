// Runs before `vite dev` and `vite build`; writes public/sitemap.xml. Plain Node ESM, no tsx required.
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const BASE_URL = "https://mnnitinfohub.lovable.app";

const entries = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/explore", changefreq: "daily", priority: "0.9" },
  { path: "/campus", changefreq: "weekly", priority: "0.8" },
  { path: "/calendar", changefreq: "weekly", priority: "0.7" },
  { path: "/timetable", changefreq: "weekly", priority: "0.7" },
  { path: "/grades", changefreq: "monthly", priority: "0.6" },
  { path: "/resources", changefreq: "weekly", priority: "0.7" },
  { path: "/auth", changefreq: "monthly", priority: "0.4" },
];

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      `    <changefreq>${e.changefreq}</changefreq>`,
      `    <priority>${e.priority}</priority>`,
      `  </url>`,
    ].join("\n")
  ),
  `</urlset>`,
].join("\n");

try {
  writeFileSync(resolve("public/sitemap.xml"), xml);
  console.log(`sitemap.xml written (${entries.length} entries)`);
} catch (err) {
  console.warn("sitemap generation skipped:", err?.message ?? err);
}
