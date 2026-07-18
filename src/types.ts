/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Difficulty = "Easy" | "Medium" | "Hard";

export type Platform = "LeetCode" | "GeeksforGeeks" | "VS Code" | "CodeStudio" | "Other";

export type DSATopic =
  | "Arrays & Hashing"
  | "Two Pointers"
  | "Sliding Window"
  | "Stack"
  | "Binary Search"
  | "Linked List"
  | "Trees"
  | "Tries"
  | "Heap / Priority Queue"
  | "Backtracking"
  | "Graphs"
  | "Advanced Graphs"
  | "1-D Dynamic Programming"
  | "2-D Dynamic Programming"
  | "Greedy"
  | "Intervals"
  | "Math & Geometry"
  | "Bit Manipulation";

export interface UserProfile {
  id: string; // 'user_1' or 'user_2'
  name: string;
  avatar: string; // Emoji
  color: string;  // Hex color or Tailwind color class
  points: number;
  streakCurrent: number;
  streakLongest: number;
}

export interface QuestionLog {
  id: string;
  userId: string;
  name: string;
  platform: Platform | string;
  topic: DSATopic | string;
  difficulty: Difficulty;
  isRevision: boolean;
  note?: string;
  date: string; // YYYY-MM-DD
  points: number;
  isDailyChallenge?: boolean;
}

export interface WeeklyPlan {
  userId: string;
  weekId: string; // e.g. "2026-W29"
  topics: DSATopic[];
  questionGoal: number;
  stretchGoal?: number;
}

export interface DailyChallenge {
  date: string; // YYYY-MM-DD
  name: string;
  topic: DSATopic;
  difficulty: Difficulty;
  points: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  category: "Beginner" | "Streak" | "Goals" | "Difficulty" | "Topic" | "Revision" | "Consistency" | "Platform" | "Special";
  tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "Master";
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";
  icon: string; // Lucide icon name or Emoji
  unlockedAt?: string; // YYYY-MM-DD
  unlockedBy: string[]; // User IDs who have unlocked it
}

export interface DBState {
  users: UserProfile[];
  questions: QuestionLog[];
  plans: WeeklyPlan[];
  dailyChallenges: DailyChallenge[];
}

export interface AIInsights {
  weeklySummary: string;
  recommendedGoal: number;
  recommendedTopics: DSATopic[];
  burnoutDetection: string; // e.g., "Low risk. Pace looks healthy."
  goalCompletionProbability: number; // e.g., 85
  projectedEndOfYearTotal: number;
  personalizedStrategy: string;
}
