#!/usr/bin/env node
const fs=require("fs");const zlib=require("zlib");const path=require("path");
const parts=["scripts/_payload-tests.part0.b64","scripts/_payload-tests.part1.b64","scripts/_payload-tests.part2.b64"].filter(p=>fs.existsSync(p));
const files=JSON.parse(parts.map(p=>fs.readFileSync(p,"utf8")).join(""));
for (const [p,b64] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(p),{recursive:true});
  fs.writeFileSync(p, zlib.inflateSync(Buffer.from(b64,"base64")));
  console.log("restored", p);
}
