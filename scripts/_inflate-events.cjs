#!/usr/bin/env node
const fs=require("fs");const zlib=require("zlib");
fs.writeFileSync("data/events.json", zlib.inflateSync(Buffer.from(fs.readFileSync("scripts/_payload-events.b64","utf8"),"base64")));
console.log("events", fs.statSync("data/events.json").size);
