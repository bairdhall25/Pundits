import json, subprocess, sys
from collections import defaultdict

def git_json(path):
    raw = subprocess.check_output(["git", "show", f"origin/main:{path}"], text=True, encoding="utf-8")
    return json.loads(raw)

events = git_json("data/events.json")
calls_raw = git_json("data/calls.json")
calls = calls_raw["calls"] if isinstance(calls_raw, dict) else calls_raw

print("=== WEEKEND GAMES (origin/main) ===")
weekend = []
for e in events["events"]:
    kd = e.get("kickoffDate", "")
    if e.get("kind") == "game" and kd and "2026-09-04" <= kd <= "2026-09-07":
        weekend.append(e)
        print(f"{kd} {e.get('kickoff','?'):12} {e['slug']:36} onHome={str(e.get('onHome')):5} {e.get('sport')} {e.get('network','')}")

print("\n=== NFL WEEK 1 HOME GAMES ===")
for e in events["events"]:
    if e.get("kind") == "game" and e.get("sport") == "nfl" and e.get("week") == 1:
        print(f"{e.get('kickoffDate')} {e.get('kickoff','?'):12} {e['slug']:36} onHome={e.get('onHome')}")

by = defaultdict(list)
for c in calls:
    slug = c.get("eventSlug")
    if not slug or c.get("kind") != "hard":
        continue
    by[slug].append(c)

print("\n=== COVERAGE ===")
slugs = [e["slug"] for e in weekend] + [
    "patriots-at-seahawks-2026",
    "49ers-vs-rams-2026",
    "bills-at-texans-2026",
]
seen = set()
for slug in slugs:
    if slug in seen:
        continue
    seen.add(slug)
    rows = by.get(slug, [])
    yes = [c["punditId"] for c in rows if c.get("side") == "yes"]
    no = [c["punditId"] for c in rows if c.get("side") == "no"]
    print(f"{slug}: YES={yes or ['(none)']} NO={no or ['(none)']} n={len(rows)}")
