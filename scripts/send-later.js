#!/usr/bin/env node
"use strict";

const USAGE = `
Usage: send-later <delay> [message]

Schedule a delayed message to stdout after <delay>.

  <delay>   Duration string: 30s, 5m, 1h, 1h30m, 90s, etc.
  [message] Text to print when the timer fires (default: "check-in")

Examples:
  node scripts/send-later.js 60m "Re-check PR #1 status"
  node scripts/send-later.js 1h30m
  node scripts/send-later.js 30s "quick ping"
`.trim();

function parseDelay(str) {
  const pattern = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/;
  const match = str.match(pattern);
  if (!match || (!match[1] && !match[2] && !match[3])) {
    return null;
  }
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

function formatMs(ms) {
  const totalSec = Math.round(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s || parts.length === 0) parts.push(`${s}s`);
  return parts.join("");
}

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
  console.log(USAGE);
  process.exit(0);
}

const delayMs = parseDelay(args[0]);
if (delayMs === null) {
  console.error(`Error: invalid delay "${args[0]}". Use formats like 30s, 5m, 1h, 1h30m.`);
  process.exit(1);
}

if (delayMs === 0) {
  console.error("Error: delay must be greater than 0.");
  process.exit(1);
}

const message = args.slice(1).join(" ") || "check-in";
const fireAt = new Date(Date.now() + delayMs);

console.log(`[send-later] Scheduled in ${formatMs(delayMs)} (fires at ${fireAt.toISOString()}): "${message}"`);

setTimeout(() => {
  console.log(`[send-later] ${message}`);
  process.exit(0);
}, delayMs);
