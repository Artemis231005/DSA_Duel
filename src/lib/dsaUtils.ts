/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuestionLog, DSATopic, Difficulty, Badge, UserProfile, WeeklyPlan } from "../types";

export const DSA_TOPICS: DSATopic[] = [
  "Arrays & Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Binary Search",
  "Linked List",
  "Trees",
  "Tries",
  "Heap / Priority Queue",
  "Backtracking",
  "Graphs",
  "Advanced Graphs",
  "1-D Dynamic Programming",
  "2-D Dynamic Programming",
  "Greedy",
  "Intervals",
  "Math & Geometry",
  "Bit Manipulation",
];

export const PLATFORMS = ["LeetCode", "GeeksforGeeks", "VS Code", "CodeStudio", "Other"];

// Generate motivation messages
export function generateMotivationMessage(user: UserProfile, friend: UserProfile, questions: QuestionLog[], plans: WeeklyPlan[]): string {
  const diff = Math.abs(user.points - friend.points);
  const leading = user.points >= friend.points;

  const userQuestions = questions.filter((q) => q.userId === user.id);
  const currentWeekPlan = plans.find((p) => p.userId === user.id);

  if (currentWeekPlan) {
    const solvedThisWeek = userQuestions.filter((q) => {
      // Crude current week check
      const qDate = new Date(q.date);
      const diffTime = Math.abs(Date.now() - qDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }).length;

    if (solvedThisWeek < currentWeekPlan.questionGoal) {
      const remaining = currentWeekPlan.questionGoal - solvedThisWeek;
      return `Only ${remaining} more question${remaining > 1 ? "s" : ""} to crush your weekly goal! Keep pushing!`;
    }
  }

  if (diff === 0) {
    return "You and your friend are neck-and-neck! Solve one question to take the lead!";
  }

  if (leading) {
    return `You're leading by ${diff} points! Don't let your guard down, ${friend.name} is catching up!`;
  } else {
    return `You are only ${diff} points behind ${friend.name}. One or two Hard questions and you'll grab the crown!`;
  }
}

// Calculate cumulative topic progress
export function calculateTopicProgress(userId: string, questions: QuestionLog[]) {
  const userLogs = questions.filter((q) => q.userId === userId);
  
  return DSA_TOPICS.map((topic) => {
    const solved = userLogs.filter((q) => q.topic === topic);
    const count = solved.length;
    // Set a mastery baseline (e.g. 10 questions solved on a topic is 100% for this game)
    const baseline = 10;
    const mastery = Math.min(100, Math.round((count / baseline) * 100));

    return {
      topic,
      count,
      mastery,
    };
  });
}

// Auto-identify strongest, weakest, most improved, and neglected topics
export function getTopicInsights(userId: string, questions: QuestionLog[]) {
  const progress = calculateTopicProgress(userId, questions);
  
  // Sort by count
  const sorted = [...progress].sort((a, b) => b.count - a.count);
  const strongest = sorted[0]?.count > 0 ? sorted[0].topic : "None yet";
  
  // Weakest / Neglected: topics with 0 or low count
  const zeroTopics = progress.filter((p) => p.count === 0);
  const neglected = zeroTopics.length > 0 
    ? zeroTopics.map((t) => t.topic).slice(0, 2).join(", ") 
    : "All topics touched!";
    
  const weakest = progress.find((p) => p.count > 0 && p.count === Math.min(...progress.filter(x => x.count > 0).map(x => x.count)))?.topic || "None";

  // Mock most improved based on recent activity
  const recentLogs = questions.filter((q) => q.userId === userId).slice(-5);
  const mostImproved = recentLogs.length > 0 ? recentLogs[0].topic : "None yet";

  return {
    strongest,
    weakest,
    neglected,
    mostImproved,
  };
}

// Check and return badges unlocked by users
export function evaluateBadges(userId: string, questions: QuestionLog[], plans: WeeklyPlan[]): Badge[] {
  const userLogs = questions.filter((q) => q.userId === userId);
  const easyLogs = userLogs.filter((q) => q.difficulty === "Easy");
  const mediumLogs = userLogs.filter((q) => q.difficulty === "Medium");
  const hardLogs = userLogs.filter((q) => q.difficulty === "Hard");
  const revisions = userLogs.filter((q) => q.isRevision);
  const platformsUsed = Array.from(new Set(userLogs.map((q) => q.platform)));

  // Group by date
  const dateMap = new Map<string, number>();
  userLogs.forEach((q) => {
    dateMap.set(q.date, (dateMap.get(q.date) || 0) + 1);
  });

  const baseBadgesList: Omit<Badge, "unlockedBy">[] = [
    {
      id: "b_beginner",
      name: "First Blood",
      description: "Solved your first DSA question!",
      category: "Beginner",
      tier: "Bronze",
      rarity: "Common",
      icon: "🎯",
    },
    {
      id: "b_streak_3",
      name: "Consistent Start",
      description: "Maintained a 3-day streak of solved questions.",
      category: "Streak",
      tier: "Silver",
      rarity: "Uncommon",
      icon: "🔥",
    },
    {
      id: "b_streak_7",
      name: "Weekly Warrior",
      description: "Achieved a 7-day streak!",
      category: "Streak",
      tier: "Gold",
      rarity: "Rare",
      icon: "⚡",
    },
    {
      id: "b_easy_10",
      name: "Easy Rider",
      description: "Solved 10 Easy-level questions.",
      category: "Difficulty",
      tier: "Bronze",
      rarity: "Common",
      icon: "🟢",
    },
    {
      id: "b_medium_10",
      name: "Medium Master",
      description: "Solved 10 Medium-level questions.",
      category: "Difficulty",
      tier: "Silver",
      rarity: "Uncommon",
      icon: "🟡",
    },
    {
      id: "b_hard_3",
      name: "Hardcore Solver",
      description: "Solved 3 Hard-level questions. Absolute legend!",
      category: "Difficulty",
      tier: "Gold",
      rarity: "Epic",
      icon: "🔴",
    },
    {
      id: "b_revision_5",
      name: "Revision Champion",
      description: "Revised 5 previously solved questions.",
      category: "Revision",
      tier: "Bronze",
      rarity: "Common",
      icon: "🔁",
    },
    {
      id: "b_multi_platform",
      name: "Platform Explorer",
      description: "Solved questions on 3 different platforms.",
      category: "Platform",
      tier: "Silver",
      rarity: "Uncommon",
      icon: "🌐",
    },
    {
      id: "b_speed_3",
      name: "Speed Demon",
      description: "Solved 3 questions in a single calendar day.",
      category: "Special",
      tier: "Gold",
      rarity: "Rare",
      icon: "🏎️",
    },
    {
      id: "b_daily_challenge",
      name: "Challenger Accepted",
      description: "Completed a Daily Coding Challenge.",
      category: "Special",
      tier: "Bronze",
      rarity: "Common",
      icon: "👑",
    },
    {
      id: "b_night_owl",
      name: "Night Owl",
      description: "Logged a question late at night (between 11 PM and 4 AM).",
      category: "Special",
      tier: "Silver",
      rarity: "Uncommon",
      icon: "🦉",
    },
    {
      id: "b_mastery_80",
      name: "Topic Architect",
      description: "Achieved 80%+ mastery on any topic.",
      category: "Topic",
      tier: "Platinum",
      rarity: "Epic",
      icon: "🏛️",
    },
    {
      id: "b_ultimate",
      name: "Algorithm Overlord",
      description: "Accumulated 200+ points on the leaderboard.",
      category: "Consistency",
      tier: "Diamond",
      rarity: "Legendary",
      icon: "💎",
    },
    {
      id: "b_hidden_funny",
      name: "Rubber Duck Therapist",
      description: "Submitted a log with a learning note longer than 80 characters.",
      category: "Special",
      tier: "Bronze",
      rarity: "Epic",
      icon: "🦆",
    },
  ];

  const unlocked: Badge[] = [];

  baseBadgesList.forEach((badge) => {
    let qualifies = false;

    if (badge.id === "b_beginner" && userLogs.length >= 1) qualifies = true;
    if (badge.id === "b_streak_3" && userLogs.length >= 3) qualifies = true; // Simpler streak representation
    if (badge.id === "b_streak_7" && userLogs.length >= 7) qualifies = true;
    if (badge.id === "b_easy_10" && easyLogs.length >= 10) qualifies = true;
    if (badge.id === "b_medium_10" && mediumLogs.length >= 10) qualifies = true;
    if (badge.id === "b_hard_3" && hardLogs.length >= 3) qualifies = true;
    if (badge.id === "b_revision_5" && revisions.length >= 5) qualifies = true;
    if (badge.id === "b_multi_platform" && platformsUsed.length >= 3) qualifies = true;
    if (badge.id === "b_speed_3") {
      qualifies = Array.from(dateMap.values()).some((count) => count >= 3);
    }
    if (badge.id === "b_daily_challenge") {
      qualifies = userLogs.some((q) => q.isDailyChallenge);
    }
    if (badge.id === "b_night_owl") {
      // Mock logic or check timestamp if available. Default to true if userLogs have notes containing 'night' or 'late'
      qualifies = userLogs.some((q) => q.note?.toLowerCase().includes("night") || q.note?.toLowerCase().includes("late"));
    }
    if (badge.id === "b_mastery_80") {
      const progresses = calculateTopicProgress(userId, questions);
      qualifies = progresses.some((p) => p.mastery >= 80);
    }
    if (badge.id === "b_ultimate") {
      const pts = userLogs.reduce((sum, q) => sum + q.points, 0);
      qualifies = pts >= 200;
    }
    if (badge.id === "b_hidden_funny") {
      qualifies = userLogs.some((q) => q.note && q.note.length > 80);
    }

    if (qualifies) {
      unlocked.push({
        ...badge,
        unlockedBy: [userId],
        unlockedAt: new Date().toISOString().split("T")[0],
      });
    }
  });

  return unlocked;
}
