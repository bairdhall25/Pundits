#!/usr/bin/env node
const fs=require("fs");const zlib=require("zlib");
const parts=["scripts/_payload-calls.part0.b64","scripts/_payload-calls.part1.b64","scripts/_payload-calls.part2.b64","scripts/_payload-calls.part3.b64"].filter(p=>fs.existsSync(p));
const b64=parts.map(p=>fs.readFileSync(p,"utf8")).join("");
fs.writeFileSync("data/calls.json", zlib.inflateSync(Buffer.from(b64,"base64")));
console.log("calls", fs.statSync("data/calls.json").size);
