#!/usr/bin/env npx tsx
/**
 * Translation Script using Claude Haiku
 *
 * Translates English source translation files to all supported locales.
 * Uses Claude Haiku for fast, cost-effective translations.
 *
 * Usage:
 *   pnpm translate              # Translate all locales, all namespaces (sequential)
 *   pnpm translate --parallel   # Translate all locales in parallel (FAST!)
 *   pnpm translate --locale=de  # Translate only German
 *   pnpm translate --namespace=marketing  # Translate only marketing namespace
 *   pnpm translate --dry-run    # Preview without writing files
 */

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const LOCALES_DIR = path.join(__dirname, '../public/locales');
const SOURCE_LOCALE = 'en';
const TARGET_LOCALES = ['de', 'es', 'fr', 'it', 'nl', 'sv', 'tr', 'pl', 'ko', 'ja'];
const NAMESPACES = ['common', 'auth', 'account', 'teams', 'billing', 'marketing'];

// Locale display names for prompts
const LOCALE_NAMES: Record<string, string> = {
  de: 'German',
  es: 'Spanish',
  fr: 'French',
  it: 'Italian',
  nl: 'Dutch',
  sv: 'Swedish',
  tr: 'Turkish',
  pl: 'Polish',
  ko: 'Korean',
  ja: 'Japanese',
};

interface TranslationStats {
  locale: string;
  namespace: string;
  totalKeys: number;
  translatedKeys: number;
  skippedKeys: number;
  errors: string[];
}

interface FlattenedTranslations {
  [key: string]: string;
}

/**
 * Flatten nested JSON object into dot-notation keys
 */
function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
): FlattenedTranslations {
  const result: FlattenedTranslations = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else if (typeof value === 'string') {
      result[newKey] = value;
    }
  }

  return result;
}

/**
 * Unflatten dot-notation keys back into nested object
 */
function unflattenObject(
  flat: FlattenedTranslations,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let current: Record<string, unknown> = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]!;
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]!] = value;
  }

  return result;
}

/**
 * Extract interpolation variables from a string
 */
function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{[^}]+\}\}/g) || [];
  return matches;
}

/**
 * Translate a batch of strings using Claude Haiku
 */
async function translateBatch(
  anthropic: Anthropic,
  strings: Record<string, string>,
  targetLocale: string,
  targetLanguage: string,
): Promise<Record<string, string>> {
  const keys = Object.keys(strings);
  if (keys.length === 0) return {};

  // Build prompt with clear instructions
  const stringsJson = JSON.stringify(strings, null, 2);

  const systemPrompt = `You are a skilled translator with a friendly, approachable voice. Translate the following JSON object from English to ${targetLanguage}.

ABOUT THE PRODUCT:
MergeMint is a fun, developer-focused platform that uses AI to score and evaluate GitHub pull requests. It helps teams:
- Recognize developer contributions with points and scores for their PRs
- Automate bug bounty rewards based on PR quality
- Track team productivity with insights and analytics
- Make code review more engaging and rewarding

The vibe is playful, modern, and developer-friendly - think of it as making the boring parts of code review actually fun.

TONE & STYLE:
- Use CASUAL, friendly, conversational language - NOT corporate or formal
- Be warm and approachable, like talking to a developer friend
- Use contractions (don't, we'll, you're) when natural
- Keep it light and engaging, avoid stiff business-speak
- Match how developers actually talk to each other
- For Korean: use casual polite form (해요체), not formal (합니다체)
- For Japanese: use です/ます form but keep it friendly and approachable

CRITICAL RULES:
1. Output ONLY valid JSON - no explanations, no markdown
2. Preserve ALL interpolation variables exactly as they appear (e.g., {{name}}, {{count}}, {{date}})
3. Preserve HTML tags if present (e.g., <strong>, <br/>)
4. Maintain the same JSON structure and keys - only translate the values
5. Keep brand names (MergeMint, GitHub, Claude, etc.) untranslated
6. Keep technical terms in English when they're commonly used that way by developers (API, PR, webhook, etc.)`;

  const userPrompt = `Translate this JSON to ${targetLanguage}:

${stringsJson}

Output only the translated JSON:`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      temperature: 0.1,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Extract JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const translated = JSON.parse(jsonMatch[0]) as Record<string, string>;

    // Validate that all keys are present
    for (const key of keys) {
      if (!(key in translated)) {
        console.warn(`  Warning: Missing translation for key "${key}"`);
        translated[key] = strings[key]!; // Fallback to English
      }

      // Validate interpolation variables are preserved
      const sourceVars = extractVariables(strings[key]!);
      const targetVars = extractVariables(translated[key] || '');
      const missingVars = sourceVars.filter((v) => !targetVars.includes(v));

      if (missingVars.length > 0) {
        console.warn(
          `  Warning: Missing variables in "${key}": ${missingVars.join(', ')}`,
        );
        // Keep original if variables are broken
        translated[key] = strings[key]!;
      }
    }

    return translated;
  } catch (error) {
    console.error(`  Error translating batch:`, error);
    // Return original strings as fallback
    return strings;
  }
}

/**
 * Translate a single namespace for a locale
 */
async function translateNamespace(
  anthropic: Anthropic,
  namespace: string,
  targetLocale: string,
  dryRun: boolean,
): Promise<TranslationStats> {
  const stats: TranslationStats = {
    locale: targetLocale,
    namespace,
    totalKeys: 0,
    translatedKeys: 0,
    skippedKeys: 0,
    errors: [],
  };

  const sourceFile = path.join(LOCALES_DIR, SOURCE_LOCALE, `${namespace}.json`);
  const targetDir = path.join(LOCALES_DIR, targetLocale);
  const targetFile = path.join(targetDir, `${namespace}.json`);

  // Load source file
  if (!fs.existsSync(sourceFile)) {
    stats.errors.push(`Source file not found: ${sourceFile}`);
    return stats;
  }

  const sourceContent = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));
  const flatSource = flattenObject(sourceContent);
  stats.totalKeys = Object.keys(flatSource).length;

  // Load existing translations if any
  let existingTranslations: FlattenedTranslations = {};
  if (fs.existsSync(targetFile)) {
    try {
      const existing = JSON.parse(fs.readFileSync(targetFile, 'utf-8'));
      existingTranslations = flattenObject(existing);
    } catch {
      console.warn(`  Could not parse existing translations for ${targetLocale}/${namespace}`);
    }
  }

  // Find keys that need translation
  const keysToTranslate: Record<string, string> = {};
  for (const [key, value] of Object.entries(flatSource)) {
    // Skip if already translated (and source hasn't changed)
    if (existingTranslations[key] && existingTranslations[key] !== value) {
      // Source changed, re-translate
      keysToTranslate[key] = value;
    } else if (!existingTranslations[key]) {
      // New key, translate
      keysToTranslate[key] = value;
    } else {
      // Already translated
      stats.skippedKeys++;
    }
  }

  console.log(
    `  ${Object.keys(keysToTranslate).length} keys to translate, ${stats.skippedKeys} already done`,
  );

  if (Object.keys(keysToTranslate).length === 0) {
    return stats;
  }

  if (dryRun) {
    console.log(`  [DRY RUN] Would translate ${Object.keys(keysToTranslate).length} keys`);
    return stats;
  }

  // Translate in batches to avoid token limits
  const BATCH_SIZE = 50;
  const keys = Object.keys(keysToTranslate);
  const targetLanguage = LOCALE_NAMES[targetLocale] || targetLocale;

  for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    const batchKeys = keys.slice(i, i + BATCH_SIZE);
    const batch: Record<string, string> = {};
    for (const key of batchKeys) {
      batch[key] = keysToTranslate[key]!;
    }

    console.log(
      `  Translating batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(keys.length / BATCH_SIZE)}...`,
    );

    const translated = await translateBatch(
      anthropic,
      batch,
      targetLocale,
      targetLanguage,
    );

    // Merge translations
    Object.assign(existingTranslations, translated);
    stats.translatedKeys += Object.keys(translated).length;

    // Small delay to avoid rate limiting
    if (i + BATCH_SIZE < keys.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Write output file
  const output = unflattenObject(existingTranslations);
  fs.writeFileSync(targetFile, JSON.stringify(output, null, 2) + '\n', 'utf-8');

  return stats;
}

/**
 * Translate all namespaces for a single locale
 */
async function translateLocale(
  anthropic: Anthropic,
  locale: string,
  namespaces: string[],
  dryRun: boolean,
): Promise<TranslationStats[]> {
  const stats: TranslationStats[] = [];
  console.log(`\n[${locale.toUpperCase()}] Starting ${LOCALE_NAMES[locale]}...`);

  for (const namespace of namespaces) {
    console.log(`  [${locale}] ${namespace}.json:`);

    const stat = await translateNamespace(
      anthropic,
      namespace,
      locale,
      dryRun,
    );

    stats.push(stat);

    if (stat.errors.length > 0) {
      for (const error of stat.errors) {
        console.error(`    [${locale}] Error: ${error}`);
      }
    }
  }

  console.log(`[${locale.toUpperCase()}] Completed ${LOCALE_NAMES[locale]}!`);
  return stats;
}

/**
 * Main translation function
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const parallel = args.includes('--parallel');
  const localeArg = args.find((a) => a.startsWith('--locale='))?.split('=')[1];
  const namespaceArg = args.find((a) => a.startsWith('--namespace='))?.split('=')[1];

  // Validate API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is not set');
    process.exit(1);
  }

  const anthropic = new Anthropic({ apiKey });

  // Determine what to translate
  const localesToProcess = localeArg ? [localeArg] : TARGET_LOCALES;
  const namespacesToProcess = namespaceArg ? [namespaceArg] : NAMESPACES;

  // Validate inputs
  for (const locale of localesToProcess) {
    if (!TARGET_LOCALES.includes(locale)) {
      console.error(`Error: Invalid locale "${locale}"`);
      console.error(`Valid locales: ${TARGET_LOCALES.join(', ')}`);
      process.exit(1);
    }
  }

  for (const namespace of namespacesToProcess) {
    if (!NAMESPACES.includes(namespace)) {
      console.error(`Error: Invalid namespace "${namespace}"`);
      console.error(`Valid namespaces: ${NAMESPACES.join(', ')}`);
      process.exit(1);
    }
  }

  console.log('Translation Script');
  console.log('==================');
  console.log(`Source: ${SOURCE_LOCALE}`);
  console.log(`Targets: ${localesToProcess.join(', ')}`);
  console.log(`Namespaces: ${namespacesToProcess.join(', ')}`);
  console.log(`Mode: ${parallel ? 'PARALLEL' : 'Sequential'}${dryRun ? ' (DRY RUN)' : ''}`);
  console.log('');

  let allStats: TranslationStats[] = [];

  if (parallel) {
    // Run all locales in parallel
    console.log(`Starting parallel translation of ${localesToProcess.length} locales...`);
    const results = await Promise.all(
      localesToProcess.map((locale) =>
        translateLocale(anthropic, locale, namespacesToProcess, dryRun)
      )
    );
    allStats = results.flat();
  } else {
    // Sequential processing (original behavior)
    for (const locale of localesToProcess) {
      const stats = await translateLocale(anthropic, locale, namespacesToProcess, dryRun);
      allStats.push(...stats);
    }
  }

  // Print summary
  console.log('\n==================');
  console.log('Summary:');
  console.log('==================');

  let totalTranslated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const stat of allStats) {
    totalTranslated += stat.translatedKeys;
    totalSkipped += stat.skippedKeys;
    totalErrors += stat.errors.length;
  }

  console.log(`Total keys translated: ${totalTranslated}`);
  console.log(`Total keys skipped (already done): ${totalSkipped}`);
  console.log(`Total errors: ${totalErrors}`);

  if (totalErrors > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
