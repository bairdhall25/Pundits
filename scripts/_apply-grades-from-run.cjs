#!/usr/bin/env node
const fs = require("fs");
const gradePath = process.argv[2] || "docs/runs/2026-10-03-grade.md";
const callsPath = process.argv[3] || "data/calls.json";
const eventsPath = process.argv[4] || "data/events.json";
const md = fs.readFileSync(gradePath, "utf8");
const calls = JSON.parse(fs.readFileSync(callsPath, "utf8"));
const byId = new Map(calls.map(c => [c.id, c]));
const grades = [];
for (const line of md.split("\n")) {
  if (!line.startsWith("| ")) continue;
  const cells = line.split("|").map(s => s.trim()).filter((_, i, a) => i > 0 && i < a.length - 1);
  if (cells.length < 7) continue;
  if (cells[0] === "call id" || cells[0].startsWith("---")) continue;
  const [id, , eventSlug, side, result, status, gradedAt, evidenceUrl] = cells;
  if (!id || (status !== "hit" && status !== "miss")) continue;
  grades.push({ id, eventSlug, side, result, status, gradedAt, evidenceUrl });
}
let applied = 0, missing = [];
for (const g of grades) {
  const c = byId.get(g.id);
  if (!c) { missing.push(g.id); continue; }
  c.status = g.status;
  c.gradedAt = g.gradedAt;
  applied++;
}
const scoreRe = /\*\*([a-z0-9-]+)\*\*:\s*([A-Z0-9&]+)\s+(\d+)\s*[–-]\s*(\d+)\s+([A-Z0-9&]+)/g;
const eventsDoc = JSON.parse(fs.readFileSync(eventsPath, "utf8"));
const events = Array.isArray(eventsDoc) ? eventsDoc : (eventsDoc.events || []);
const bySlug = new Map(events.map(e => [e.slug, e]));
let scored = 0;
const urlRe = /\*\*([a-z0-9-]+)\*\*:.*?ESPN:\s*(https:\/\/www\.espn\.com\/[^\s·]+)/g;
const urls = new Map();
let um;
while ((um = urlRe.exec(md))) urls.set(um[1], um[2]);
let m;
while ((m = scoreRe.exec(md))) {
  const [, slug, , awayScore, homeScore] = m;
  const ev = bySlug.get(slug);
  if (!ev) continue;
  ev.awayScore = Number(awayScore);
  ev.homeScore = Number(homeScore);
  if (urls.has(slug)) ev.resultUrl = urls.get(slug);
  scored++;
}
fs.writeFileSync(callsPath, JSON.stringify(calls, null, 2) + "\n");
if (Array.isArray(eventsDoc)) fs.writeFileSync(eventsPath, JSON.stringify(eventsDoc, null, 2) + "\n");
else { eventsDoc.events = events; fs.writeFileSync(eventsPath, JSON.stringify(eventsDoc, null, 2) + "\n"); }
const hit = grades.filter(g => g.status === "hit").length;
const miss = grades.filter(g => g.status === "miss").length;
console.log(JSON.stringify({ gradesInMd: grades.length, hit, miss, applied, missing: missing.length, scored }, null, 2));
if (applied < 50) process.exit(1);
