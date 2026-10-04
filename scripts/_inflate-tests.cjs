#!/usr/bin/env node
const fs=require("fs");const zlib=require("zlib");const path=require("path");
const parts=[];
for (let i=0;;i++){const p="scripts/_payload-tests.part"+i+".b64"; if(!fs.existsSync(p)) break; parts.push(fs.readFileSync(p,"utf8").replace(/\s+/g,""));}
const map=JSON.parse(zlib.inflateSync(Buffer.from(parts.join(""),"base64")).toString());
for (const [p,b64] of Object.entries(map)) {
  fs.mkdirSync(path.dirname(p),{recursive:true});
  fs.writeFileSync(p, zlib.inflateSync(Buffer.from(b64,"base64")));
  console.log("restored", p, fs.statSync(p).size);
}
