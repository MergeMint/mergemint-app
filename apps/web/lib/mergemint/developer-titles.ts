/**
 * Developer Title System
 * 
 * Assigns gaming-style titles and descriptions to developers based on their
 * contribution patterns, creating an engaging gamification experience.
 */

export type DeveloperTitle = {
  title: string;
  subtitle: string;
  description: string;
  icon: string; // emoji
  color: string; // tailwind color class
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
};

export type DeveloperStats = {
  totalScore: number;
  totalPrs: number;
  eligiblePrs: number;
  eligibilityRate: number;
  avgScore: number;
  rank: number;
  totalDevs: number;
  p0Count: number;
  p1Count: number;
  p2Count: number;
  p3Count: number;
  componentCount: number;
  topComponentPercentage: number; // % of work in their top component
  totalAdditions: number;
  totalDeletions: number;
  streak: number;
};

// Title definitions
const TITLES: Record<string, DeveloperTitle> = {
  // Legendary titles (very rare, exceptional achievements)
  LEGEND: {
    title: 'The Legend',
    subtitle: 'Hall of Fame',
    description: 'A true legend. Top performer with exceptional contributions across the board.',
    icon: '👑',
    color: 'text-yellow-500',
    rarity: 'legendary',
  },
  FIREFIGHTER: {
    title: 'The Firefighter',
    subtitle: 'Crisis Commander',
    description: 'When production burns, they answer the call. Master of critical bug fixes.',
    icon: '🔥',
    color: 'text-red-500',
    rarity: 'legendary',
  },
  
  // Epic titles (rare, impressive patterns)
  RENAISSANCE: {
    title: 'Renaissance Dev',
    subtitle: 'Master of All',
    description: 'A true polymath. Contributes meaningfully across the entire codebase.',
    icon: '🎨',
    color: 'text-purple-500',
    rarity: 'epic',
  },
  SNIPER: {
    title: 'The Sniper',
    subtitle: 'One Shot, One Kill',
    description: 'Fewer PRs, maximum impact. Every contribution counts.',
    icon: '🎯',
    color: 'text-blue-500',
    rarity: 'epic',
  },
  PERFECTIONIST: {
    title: 'The Perfectionist',
    subtitle: 'Zero Defects',
    description: 'Near-perfect eligibility rate. Quality is not negotiable.',
    icon: '✨',
    color: 'text-emerald-500',
    rarity: 'epic',
  },
  MACHINE: {
    title: 'The Machine',
    subtitle: 'Unstoppable Force',
    description: 'An absolute unit of productivity. PRs flow like a river.',
    icon: '🤖',
    color: 'text-cyan-500',
    rarity: 'epic',
  },

  // Rare titles (notable patterns)
  BUG_HUNTER: {
    title: 'Bug Hunter',
    subtitle: 'Exterminator',
    description: 'Seeks out and destroys bugs with precision. No bug is safe.',
    icon: '🐛',
    color: 'text-orange-500',
    rarity: 'rare',
  },
  SURGEON: {
    title: 'The Surgeon',
    subtitle: 'Precision Expert',
    description: 'Small, precise changes with maximum effectiveness. Surgical precision.',
    icon: '⚔️',
    color: 'text-red-400',
    rarity: 'rare',
  },
  CLEANER: {
    title: 'The Cleaner',
    subtitle: 'Code Janitor',
    description: 'Removes more code than they add. Fighting technical debt one line at a time.',
    icon: '🧹',
    color: 'text-green-500',
    rarity: 'rare',
  },
  ARCHITECT: {
    title: 'The Architect',
    subtitle: 'Foundation Builder',
    description: 'Builds the foundations others stand on. Large-scale contributions.',
    icon: '🏗️',
    color: 'text-slate-500',
    rarity: 'rare',
  },
  SPECIALIST: {
    title: 'Domain Specialist',
    subtitle: 'Expert Zone',
    description: 'Deep expertise in their domain. The go-to person for their component.',
    icon: '🔬',
    color: 'text-indigo-500',
    rarity: 'rare',
  },
  STREAKER: {
    title: 'The Streaker',
    subtitle: 'Consistency King',
    description: 'Day after day, week after week. Unbroken commitment.',
    icon: '⚡',
    color: 'text-amber-500',
    rarity: 'rare',
  },

  // Uncommon titles (good patterns)
  RISING_STAR: {
    title: 'Rising Star',
    subtitle: 'On the Rise',
    description: 'Climbing the ranks with impressive momentum. One to watch.',
    icon: '⭐',
    color: 'text-yellow-400',
    rarity: 'uncommon',
  },
  JACK_OF_TRADES: {
    title: 'Jack of All Trades',
    subtitle: 'Versatile',
    description: 'Comfortable across multiple components. Adaptable and reliable.',
    icon: '🃏',
    color: 'text-violet-500',
    rarity: 'uncommon',
  },
  STEADY_HAND: {
    title: 'Steady Hand',
    subtitle: 'Reliable Force',
    description: 'Consistent, reliable contributions. The backbone of the team.',
    icon: '🤝',
    color: 'text-blue-400',
    rarity: 'uncommon',
  },
  QUALITY_GUARDIAN: {
    title: 'Quality Guardian',
    subtitle: 'Standards Keeper',
    description: 'Maintains high standards in every PR. Quality over quantity.',
    icon: '🛡️',
    color: 'text-teal-500',
    rarity: 'uncommon',
  },

  // Common titles (base level)
  CONTRIBUTOR: {
    title: 'Contributor',
    subtitle: 'Team Player',
    description: 'A valued member of the team. Every contribution matters.',
    icon: '👤',
    color: 'text-gray-500',
    rarity: 'common',
  },
  NEWCOMER: {
    title: 'Newcomer',
    subtitle: 'Fresh Face',
    description: 'Just getting started. The journey of a thousand PRs begins with one.',
    icon: '🌱',
    color: 'text-lime-500',
    rarity: 'common',
  },
};

/**
 * Calculate the best fitting title for a developer based on their stats
 */
export function calculateDeveloperTitle(stats: DeveloperStats): DeveloperTitle {
  const {
    totalScore,
    totalPrs,
    eligiblePrs,
    eligibilityRate,
    avgScore,
    rank,
    totalDevs,
    p0Count,
    p1Count,
    p2Count,
    p3Count,
    componentCount,
    topComponentPercentage,
    totalAdditions,
    totalDeletions,
    streak,
  } = stats;

  const criticalRatio = totalPrs > 0 ? (p0Count + p1Count) / totalPrs : 0;
  const deletionRatio = (totalAdditions + totalDeletions) > 0 
    ? totalDeletions / (totalAdditions + totalDeletions) 
    : 0;
  const rankPercentile = totalDevs > 0 ? (totalDevs - rank + 1) / totalDevs : 0;

  // === LEGENDARY TITLES ===
  
  // The Legend - Top 3 with high scores
  if (rank <= 3 && totalScore >= 500 && eligibilityRate >= 70) {
    return TITLES.LEGEND!;
  }

  // The Firefighter - High critical bug ratio
  if (criticalRatio >= 0.4 && (p0Count + p1Count) >= 5 && totalScore >= 200) {
    return TITLES.FIREFIGHTER!;
  }

  // === EPIC TITLES ===

  // Renaissance Dev - Works on 5+ components with good distribution
  if (componentCount >= 5 && topComponentPercentage <= 40 && totalPrs >= 10) {
    return TITLES.RENAISSANCE!;
  }

  // The Sniper - Few PRs but very high average score
  if (totalPrs <= 5 && avgScore >= 80 && eligibilityRate >= 80) {
    return TITLES.SNIPER!;
  }

  // The Perfectionist - Near-perfect eligibility
  if (eligibilityRate >= 95 && totalPrs >= 5) {
    return TITLES.PERFECTIONIST!;
  }

  // The Machine - High volume contributor
  if (totalPrs >= 20 && rankPercentile >= 0.9) {
    return TITLES.MACHINE!;
  }

  // === RARE TITLES ===

  // Bug Hunter - Significant P0/P1 work
  if (criticalRatio >= 0.25 && (p0Count + p1Count) >= 3) {
    return TITLES.BUG_HUNTER!;
  }

  // The Surgeon - Small precise changes with high impact
  if (totalPrs > 0 && (totalAdditions + totalDeletions) / totalPrs <= 100 && avgScore >= 50) {
    return TITLES.SURGEON!;
  }

  // The Cleaner - High deletion ratio (refactoring focus)
  if (deletionRatio >= 0.6 && totalDeletions >= 500) {
    return TITLES.CLEANER!;
  }

  // The Architect - Large-scale contributions
  if (totalAdditions >= 5000 && totalPrs >= 5) {
    return TITLES.ARCHITECT!;
  }

  // Domain Specialist - Deep focus on one component
  if (topComponentPercentage >= 70 && totalPrs >= 5) {
    return TITLES.SPECIALIST!;
  }

  // The Streaker - Long activity streaks
  if (streak >= 7) {
    return TITLES.STREAKER!;
  }

  // === UNCOMMON TITLES ===

  // Rising Star - Good rank percentile
  if (rankPercentile >= 0.7 && totalPrs >= 3) {
    return TITLES.RISING_STAR!;
  }

  // Jack of All Trades - Works across multiple components
  if (componentCount >= 3 && topComponentPercentage <= 50) {
    return TITLES.JACK_OF_TRADES!;
  }

  // Quality Guardian - High eligibility rate
  if (eligibilityRate >= 80 && totalPrs >= 3) {
    return TITLES.QUALITY_GUARDIAN!;
  }

  // Steady Hand - Consistent contributor
  if (totalPrs >= 5 && eligibilityRate >= 50) {
    return TITLES.STEADY_HAND!;
  }

  // === COMMON TITLES ===

  // Newcomer - Low activity
  if (totalPrs <= 2) {
    return TITLES.NEWCOMER!;
  }

  // Default
  return TITLES.CONTRIBUTOR!;
}

/**
 * Get secondary badges/traits for a developer
 */
export function calculateDeveloperBadges(stats: DeveloperStats): string[] {
  const badges: string[] = [];
  const {
    totalPrs,
    eligibilityRate,
    p0Count,
    p1Count,
    componentCount,
    totalDeletions,
    totalAdditions,
    streak,
  } = stats;

  // Critical fixes badge
  if (p0Count >= 1) {
    badges.push('🚨 P0 Hero');
  }
  if (p1Count >= 3) {
    badges.push('⚠️ P1 Crusher');
  }

  // Quality badge
  if (eligibilityRate >= 90 && totalPrs >= 3) {
    badges.push('✅ High Quality');
  }

  // Versatility badge
  if (componentCount >= 4) {
    badges.push('🔄 Versatile');
  }

  // Refactoring badge
  if (totalDeletions > totalAdditions && totalDeletions >= 200) {
    badges.push('♻️ Refactorer');
  }

  // Streak badge
  if (streak >= 5) {
    badges.push(`🔥 ${streak}-Day Streak`);
  }

  // Volume badge
  if (totalPrs >= 15) {
    badges.push('📈 High Volume');
  }

  return badges.slice(0, 4); // Max 4 badges
}

/**
 * Get a fun flavor text based on the title
 */
export function getTitleFlavorText(title: DeveloperTitle): string {
  const flavorTexts: Record<string, string[]> = {
    LEGEND: [
      "They came, they saw, they merged.",
      "A name whispered in reverence across code reviews.",
      "When they open a PR, the CI pipeline trembles with respect.",
    ],
    FIREFIGHTER: [
      "Production incidents fear this name.",
      "While others sleep, they fight fires.",
      "The first responder. The last line of defense.",
    ],
    RENAISSANCE: [
      "No corner of the codebase remains unexplored.",
      "Today frontend, tomorrow backend, always shipping.",
      "A polymath in a world of specialists.",
    ],
    SNIPER: [
      "Quality over quantity. Always.",
      "Every line of code is deliberate. Every PR, a masterpiece.",
      "When they finally push, you better pay attention.",
    ],
    PERFECTIONIST: [
      "Tests? Written. Documentation? Complete. Edge cases? Handled.",
      "The PR checklist was made for mortals.",
      "Perfection is not a goal, it's a habit.",
    ],
    MACHINE: [
      "PRs go brrrrr.",
      "Their GitHub graph is a solid green wall.",
      "Sleep is for those who aren't shipping.",
    ],
    BUG_HUNTER: [
      "No bug escapes their gaze.",
      "Armed with console.log and determination.",
      "The natural predator of null pointer exceptions.",
    ],
  };

  const texts = flavorTexts[title.title.toUpperCase().replace(/\s/g, '_')] ?? [
    "Making the codebase better, one PR at a time.",
    "A valued contributor to the team.",
  ];

  return texts[Math.floor(Math.random() * texts.length)] ?? texts[0]!;
}

