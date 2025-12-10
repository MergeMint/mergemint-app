#!/usr/bin/env node
/**
 * Post-build script to add cron (scheduled) handler to OpenNext worker
 *
 * This script modifies the generated .open-next/worker.js to add
 * a scheduled handler that processes unprocessed PRs.
 *
 * Run after `pnpm build` or `npx @opennextjs/cloudflare build`
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workerPath = path.join(__dirname, '../.open-next/worker.js');

if (!fs.existsSync(workerPath)) {
  console.error('Error: .open-next/worker.js not found. Run build first.');
  process.exit(1);
}

let workerCode = fs.readFileSync(workerPath, 'utf-8');

// Check if scheduled handler already exists
if (workerCode.includes('async scheduled(')) {
  console.log('Scheduled handler already exists, skipping...');
  process.exit(0);
}

// Find the export default and add scheduled handler
const scheduledHandler = `
  /**
   * Scheduled (cron) handler - processes ONE unprocessed PR per invocation
   * Triggered every minute by cron configuration in wrangler.toml
   * Processes ~60 PRs/hour, ~1440 PRs/day
   */
  async scheduled(event, env, ctx) {
    console.log('[Cron] Triggered at ' + new Date(event.scheduledTime).toISOString());

    const siteUrl = env.NEXT_PUBLIC_SITE_URL || 'https://mergemint.dev';
    const cronSecret = env.CRON_SECRET;

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (cronSecret) {
        headers['Authorization'] = 'Bearer ' + cronSecret;
      }

      const response = await fetch(siteUrl + '/api/cron/process-prs?postComment=true', {
        method: 'GET',
        headers,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.queueEmpty) {
          console.log('[Cron] Queue empty - all PRs processed');
        } else {
          console.log('[Cron] Processed PR #' + (result.pr?.number || '?') + ' score=' + (result.pr?.score || '?'));
        }
      } else {
        const errText = await response.text();
        console.error('[Cron] API call failed: ' + response.status + ' - ' + errText);
      }
    } catch (err) {
      console.error('[Cron] Error:', err);
    }
  },`;

// Insert scheduled handler after the fetch handler
// Look for the pattern "async fetch(" and then find the closing brace + comma
const fetchPattern = /async fetch\s*\([^)]*\)\s*\{/;
const fetchMatch = workerCode.match(fetchPattern);

if (!fetchMatch) {
  console.error('Error: Could not find fetch handler in worker.js');
  process.exit(1);
}

// Find the matching closing brace for the fetch function
let braceCount = 0;
let inFetch = false;
let fetchEndIndex = -1;
const startIndex = fetchMatch.index;

for (let i = startIndex; i < workerCode.length; i++) {
  if (workerCode[i] === '{') {
    braceCount++;
    inFetch = true;
  } else if (workerCode[i] === '}') {
    braceCount--;
    if (inFetch && braceCount === 0) {
      fetchEndIndex = i;
      break;
    }
  }
}

if (fetchEndIndex === -1) {
  console.error('Error: Could not find end of fetch handler');
  process.exit(1);
}

// Insert the scheduled handler after the fetch handler
// Look for the comma after the closing brace
let insertIndex = fetchEndIndex + 1;
while (insertIndex < workerCode.length && /\s/.test(workerCode[insertIndex])) {
  insertIndex++;
}
if (workerCode[insertIndex] === ',') {
  insertIndex++;
}

const modifiedCode =
  workerCode.slice(0, insertIndex) +
  '\n' + scheduledHandler +
  workerCode.slice(insertIndex);

fs.writeFileSync(workerPath, modifiedCode);
console.log('✅ Added scheduled handler to worker.js');
