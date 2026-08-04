import fs from "fs";
import { TECHS, UPGRADES, WTECHS } from "./split-v48.mjs";

const FILE = new URL("../index.html", import.meta.url).pathname;
let src = fs.readFileSync(FILE, "utf8");

// Find the [ ... ] body of `var NAME = [` by bracket matching, honouring strings and comments.
function arrayBounds(text, name) {
  const start = text.indexOf("var " + name + " = [");
  if (start < 0) throw new Error("no " + name);
  let i = text.indexOf("[", start), depth = 0, q = null;
  for (; i < text.length; i++) {
    const c = text[i], p = text[i - 1];
    if (q) { if (c === q && p !== "\\") q = null; continue; }
    if (c === '"' || c === "'") { q = c; continue; }
    if (c === "/" && text[i + 1] === "/") { i = text.indexOf("\n", i); continue; }
    if (c === "[" || c === "{" || c === "(") depth++;
    else if (c === "]" || c === "}" || c === ")") { depth--; if (depth === 0) return [text.indexOf("[", start), i + 1]; }
  }
  throw new Error("unbalanced " + name);
}

// Consume one JS value starting at `i`, stop at the `,` or `}` that ends the property.
function valueEnd(text, i) {
  let depth = 0, q = null;
  for (; i < text.length; i++) {
    const c = text[i], p = text[i - 1];
    if (q) { if (c === q && p !== "\\") q = null; continue; }
    if (c === '"' || c === "'") { q = c; continue; }
    if (c === "[" || c === "{" || c === "(") depth++;
    else if (c === "]" || c === "}" || c === ")") { if (depth === 0) return i; depth--; }
    else if (c === "," && depth === 0) return i;
  }
  throw new Error("no value end");
}

const lit = (v) => (v && typeof v === "object" && v.raw !== undefined) ? v.raw : JSON.stringify(v);

let done = 0, missing = [];
for (const [name, map] of [["TECHS", TECHS], ["UPGRADES", UPGRADES], ["WTECHS", WTECHS]]) {
  const [a, b] = arrayBounds(src, name);
  let body = src.slice(a, b);
  for (const id of Object.keys(map)) {
    const anchor = body.indexOf('{ id: "' + id + '",');
    if (anchor < 0) { missing.push(name + ":" + id + " (no entry)"); continue; }
    const dk = body.indexOf("desc:", anchor);
    if (dk < 0) { missing.push(name + ":" + id + " (no desc)"); continue; }
    const vs = dk + 5;
    const ve = valueEnd(body, vs);
    const [lore, effect] = map[id];
    const parts = [];
    if (lore !== null) parts.push("lore: " + lit(lore));
    if (effect !== null) parts.push("effect: " + lit(effect));
    body = body.slice(0, dk) + parts.join(",\n    ") + body.slice(ve);
    done++;
  }
  src = src.slice(0, a) + body + src.slice(b);
}

fs.writeFileSync(FILE, src);
console.log("rewrote", done, "entries");
if (missing.length) { console.log("MISSING:\n  " + missing.join("\n  ")); process.exit(1); }
