from pathlib import Path
import base64
import json

root = Path(__file__).parent
html = (root / "index.html").read_text(encoding="utf-8")
photos = {}
for p in (root / "photos").glob("*.jpg"):
    photos[p.stem] = "data:image/jpeg;base64," + base64.b64encode(p.read_bytes()).decode("ascii")

inject = (
    "const PHOTOS = "
    + json.dumps(photos)
    + ";\n    function photo(id) { return PHOTOS[id] || \"\"; }\n    "
)
html = html.replace("    const pundits = [", inject + "const pundits = [", 1)
html = html.replace("photos/${p.id}.jpg", "${photo(p.id)}")
out = root / "pundits-mockup-share.html"
out.write_text(html, encoding="utf-8")
print("wrote", out, "bytes", out.stat().st_size)
print("photos/ leftover", html.count("photos/"))
