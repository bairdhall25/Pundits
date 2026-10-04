#!/usr/bin/env node
const fs=require("fs");const zlib=require("zlib");const path=require("path");
const files=JSON.parse(fs.readFileSync("scripts/_payload-tests.json","utf8"));
for (const [p,b64] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(p),{recursive:true});
  fs.writeFileSync(p, zlib.inflateSync(Buffer.from(b64,"base64")));
  console.log("restored", p);
}
