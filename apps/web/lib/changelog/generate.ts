/* eslint-disable @typescript-eslint/no-explicit-any */
import Anthropic from '@anthropic-ai/sdk';

export type ChangelogCategory = 'new_feature' | 'improvement' | 'bug_fix' | 'breaking_change';

export interface ProductContext {
  productName?: string | null;
  productDescription?: string | null;
  targetAudience?: string | null;
  scrapedContent?: string | null;
}

export interface PRInfo {
  number: number;
  title: string;
  body: string | null;
  filesChanged: string[];
  additions: number;
  deletions: number;
  componentName?: string | null;
}

export interface GeneratedChangelogEntry {
  title: string;
  description: string;
  category: ChangelogCategory;
  skip?: boolean;
  skipReason?: string;
}

const SYSTEM_PROMPT = `You are a product changelog writer for a software product. Your job is to transform technical pull request descriptions into user-friendly changelog entries that non-technical users can understand.

Guidelines:
1. Write in simple, clear language that anyone can understand
2. Focus on USER BENEFITS, not implementation details
3. Avoid technical jargon, code references, or file names
4. Keep titles short (5-10 words) and benefit-focused
5. Keep descriptions concise (1-2 sentences)
6. Categorize accurately based on the actual change type

Categories:
- new_feature: Brand new functionality that didn't exist before
- improvement: Enhancement to existing functionality
- bug_fix: Fix for something that was broken
- breaking_change: Change that may affect existing users' workflows

IMPORTANT: Some PRs should NOT be included in a public changelog. Skip PRs that are:
- Internal refactoring with no user-visible changes
- Test-only changes (adding/updating tests)
- CI/CD pipeline changes
- Developer tooling/configuration changes
- Documentation updates (unless user-facing docs)
- Dependency updates (unless they fix a user-facing issue)
- Code style/formatting changes

If a PR should be skipped, set "skip": true and provide a brief "skipReason".

Output valid JSON only, no markdown formatting.`;

function buildUserPrompt(productContext: ProductContext, pr: PRInfo): string {
  const parts: string[] = [];

  // Product context
  if (productContext.productName || productContext.productDescription || productContext.targetAudience) {
    parts.push('## Product Context');
    if (productContext.productName) {
      parts.push(`Product Name: ${productContext.productName}`);
    }
    if (productContext.productDescription) {
      parts.push(`Description: ${productContext.productDescription}`);
    }
    if (productContext.targetAudience) {
      parts.push(`Target Audience: ${productContext.targetAudience}`);
    }
    if (productContext.scrapedContent) {
      // Truncate scraped content if too long
      const maxScrapedLength = 2000;
      const truncatedScraped = productContext.scrapedContent.length > maxScrapedLength
        ? productContext.scrapedContent.slice(0, maxScrapedLength) + '...'
        : productContext.scrapedContent;
      parts.push(`Website Content:\n${truncatedScraped}`);
    }
    parts.push('');
  }

  // PR information
  parts.push('## Pull Request');
  parts.push(`Title: ${pr.title}`);
  if (pr.body) {
    // Truncate body if too long
    const maxBodyLength = 3000;
    const truncatedBody = pr.body.length > maxBodyLength
      ? pr.body.slice(0, maxBodyLength) + '...'
      : pr.body;
    parts.push(`Description:\n${truncatedBody}`);
  }
  parts.push(`PR #${pr.number}`);
  parts.push(`Changes: +${pr.additions} -${pr.deletions} lines`);

  if (pr.filesChanged.length > 0) {
    // Show file summary without full paths
    const fileCategories = categorizeFiles(pr.filesChanged);
    parts.push(`Files affected: ${fileCategories}`);
  }

  if (pr.componentName) {
    parts.push(`Component: ${pr.componentName}`);
  }

  parts.push('');
  parts.push('## Task');
  parts.push('Analyze this PR and decide if it should be included in a public changelog.');
  parts.push('');
  parts.push('If it SHOULD be included, output:');
  parts.push('{"skip": false, "title": "Short benefit-focused title", "description": "User-friendly description", "category": "improvement"}');
  parts.push('');
  parts.push('If it should be SKIPPED (internal/technical change), output:');
  parts.push('{"skip": true, "skipReason": "Brief reason why this is not user-facing"}');

  return parts.join('\n');
}

function categorizeFiles(files: string[]): string {
  const categories = new Set<string>();

  for (const file of files) {
    const lower = file.toLowerCase();
    if (lower.includes('test') || lower.includes('spec')) {
      categories.add('tests');
    } else if (lower.includes('readme') || lower.includes('doc') || lower.endsWith('.md')) {
      categories.add('documentation');
    } else if (lower.includes('component') || lower.includes('.tsx') || lower.includes('.jsx')) {
      categories.add('UI components');
    } else if (lower.includes('api') || lower.includes('route')) {
      categories.add('API');
    } else if (lower.includes('style') || lower.includes('.css') || lower.includes('.scss')) {
      categories.add('styling');
    } else if (lower.includes('config') || lower.includes('.json') || lower.includes('.yaml')) {
      categories.add('configuration');
    } else if (lower.includes('migration') || lower.includes('schema')) {
      categories.add('database');
    } else {
      categories.add('core logic');
    }
  }

  return Array.from(categories).slice(0, 3).join(', ');
}

export async function generateChangelogEntry(
  productContext: ProductContext,
  pr: PRInfo,
): Promise<GeneratedChangelogEntry> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const anthropic = new Anthropic({ apiKey });

  const userPrompt = buildUserPrompt(productContext, pr);

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 500,
    temperature: 0.3,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  // Extract text content
  const textContent = response.content.find(c => c.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from LLM');
  }

  // Parse JSON response
  let parsed: any;
  try {
    // Try to extract JSON from the response (in case there's extra text)
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('Failed to parse LLM response:', textContent.text);
    throw new Error('Failed to parse LLM response as JSON');
  }

  // Check if PR should be skipped
  if (parsed.skip === true) {
    return {
      title: '',
      description: '',
      category: 'improvement',
      skip: true,
      skipReason: parsed.skipReason || 'Not user-facing',
    };
  }

  // Validate response for non-skipped entries
  if (!parsed.title || !parsed.description || !parsed.category) {
    throw new Error('Invalid LLM response: missing required fields');
  }

  // Validate category
  const validCategories: ChangelogCategory[] = ['new_feature', 'improvement', 'bug_fix', 'breaking_change'];
  if (!validCategories.includes(parsed.category)) {
    parsed.category = 'improvement'; // Default fallback
  }

  return {
    title: String(parsed.title).trim(),
    description: String(parsed.description).trim(),
    category: parsed.category as ChangelogCategory,
    skip: false,
  };
}

export async function generateMultipleChangelogEntries(
  productContext: ProductContext,
  prs: PRInfo[],
): Promise<Array<{ pr: PRInfo; entry: GeneratedChangelogEntry; error?: string }>> {
  const results: Array<{ pr: PRInfo; entry: GeneratedChangelogEntry; error?: string }> = [];

  // Process in sequence to avoid rate limiting
  for (const pr of prs) {
    try {
      const entry = await generateChangelogEntry(productContext, pr);
      results.push({ pr, entry });
    } catch (error) {
      console.error(`Failed to generate changelog for PR #${pr.number}:`, error);
      results.push({
        pr,
        entry: {
          title: pr.title,
          description: pr.body?.slice(0, 200) || 'No description available',
          category: 'improvement',
        },
        error: (error as Error).message,
      });
    }

    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return results;
}
