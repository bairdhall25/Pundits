#!/usr/bin/env node
const fs=require("fs");const zlib=require("zlib");
fs.writeFileSync("data/calls.json", zlib.inflateSync(Buffer.from(fs.readFileSync("scripts/_payload-calls.b64","utf8"),"base64")));
console.log("calls", fs.statSync("data/calls.json").size);
