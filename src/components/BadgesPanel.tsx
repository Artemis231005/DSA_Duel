/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Award, Lock, CheckCircle, Flame, Star, Sparkles, Filter } from "lucide-react";
import { Badge, UserProfile, QuestionLog } from "../types";
import { evaluateBadges } from "../lib/dsaUtils";

interface BadgesPanelProps {
  currentUser: UserProfile;
  friendUser: UserProfile;
  questions: QuestionLog[];
}

export default function BadgesPanel({ currentUser, friendUser, questions }: BadgesPanelProps) {
  const [selectedRarity, setSelectedRarity] = useState<string>("All");

  const user1Unlocked = evaluateBadges(currentUser.id, questions, []);
  const user2Unlocked = evaluateBadges(friendUser.id, questions, []);

  // Merge default badge definition list with actual unlock states
  const getBadgesCatalog = (): (Badge & { u1Unlocked: boolean; u2Unlocked: boolean })[] => {
    // Re-evaluate complete list
    const u1UnlockedMap = new Set(user1Unlocked.map((b) => b.id));
    const u2UnlockedMap = new Set(user2Unlocked.map((b) => b.id));

    // Complete list of defined badges (same as evaluateBadges catalog)
    const baseList: Omit<Badge, "unlockedBy">[] = [
      {
        id: "b_beginner",
        name: "First Blood",
        description: "Solved your first DSA question on the platform!",
        category: "Beginner",
        tier: "Bronze",
        rarity: "Common",
        icon: "🎯",
      },
      {
        id: "b_streak_3",
        name: "Consistent Start",
        description: "Maintain a 3-day active streak of solved questions.",
        category: "Streak",
        tier: "Silver",
        rarity: "Uncommon",
        icon: "🔥",
      },
      {
        id: "b_streak_7",
        name: "Weekly Warrior",
        description: "Achieve a solid 7-day streak!",
        category: "Streak",
        tier: "Gold",
        rarity: "Rare",
        icon: "⚡",
      },
      {
        id: "b_easy_10",
        name: "Easy Rider",
        description: "Solve 10 Easy-difficulty questions.",
        category: "Difficulty",
        tier: "Bronze",
        rarity: "Common",
        icon: "🟢",
      },
      {
        id: "b_medium_10",
        name: "Medium Master",
        description: "Solve 10 Medium-difficulty questions.",
        category: "Difficulty",
        tier: "Silver",
        rarity: "Uncommon",
        icon: "🟡",
      },
      {
        id: "b_hard_3",
        name: "Hardcore Solver",
        description: "Solve 3 Hard-difficulty questions. Absolute beast!",
        category: "Difficulty",
        tier: "Gold",
        rarity: "Epic",
        icon: "🔴",
      },
      {
        id: "b_revision_5",
        name: "Revision Champion",
        description: "Revise 5 previously solved questions.",
        category: "Revision",
        tier: "Bronze",
        rarity: "Common",
        icon: "🔁",
      },
      {
        id: "b_multi_platform",
        name: "Platform Explorer",
        description: "Solve questions on 3 different coding sites.",
        category: "Platform",
        tier: "Silver",
        rarity: "Uncommon",
        icon: "🌐",
      },
      {
        id: "b_speed_3",
        name: "Speed Demon",
        description: "Solve 3 or more questions in a single calendar day.",
        category: "Special",
        tier: "Gold",
        rarity: "Rare",
        icon: "🏎️",
      },
      {
        id: "b_daily_challenge",
        name: "Challenger Accepted",
        description: "Complete a Daily Coding Challenge on the dashboard.",
        category: "Special",
        tier: "Bronze",
        rarity: "Common",
        icon: "👑",
      },
      {
        id: "b_night_owl",
        name: "Night Owl",
        description: "Log a solved question late at night (between 11 PM and 4 AM).",
        category: "Special",
        tier: "Silver",
        rarity: "Uncommon",
        icon: "🦉",
      },
      {
        id: "b_mastery_80",
        name: "Topic Architect",
        description: "Achieve 80%+ mastery (10+ questions) on any topic.",
        category: "Topic",
        tier: "Platinum",
        rarity: "Epic",
        icon: "🏛️",
      },
      {
        id: "b_ultimate",
        name: "Algorithm Overlord",
        description: "Accumulate 200+ total points on the leaderboard.",
        category: "Consistency",
        tier: "Diamond",
        rarity: "Legendary",
        icon: "💎",
      },
      {
        id: "b_hidden_funny",
        name: "Rubber Duck Therapist",
        description: "Submit an entry with a learning note longer than 80 characters.",
        category: "Special",
        tier: "Bronze",
        rarity: "Epic",
        icon: "🦆",
      },
    ];

    return baseList.map((badge) => ({
      ...badge,
      unlockedBy: [
        ...(u1UnlockedMap.has(badge.id) ? [currentUser.id] : []),
        ...(u2UnlockedMap.has(badge.id) ? [friendUser.id] : []),
      ],
      u1Unlocked: u1UnlockedMap.has(badge.id),
      u2Unlocked: u2UnlockedMap.has(badge.id),
    }));
  };

  const catalog = getBadgesCatalog().filter((b) => {
    return selectedRarity === "All" || b.rarity === selectedRarity;
  });

  const getRarityBadgeColor = (rarity: string) => {
    if (rarity === "Common") return "bg-gray-100 text-gray-700 border-gray-300";
    if (rarity === "Uncommon") return "bg-blue-50 text-blue-700 border-blue-200";
    if (rarity === "Rare") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (rarity === "Epic") return "bg-purple-50 text-[#7C3AED] border-purple-200";
    if (rarity === "Legendary") return "bg-amber-100 text-amber-800 border-amber-300 font-extrabold";
    return "bg-red-50 text-red-700 border-red-200";
  };

  const getTierColor = (tier: string) => {
    if (tier === "Bronze") return "text-amber-700 font-extrabold";
    if (tier === "Silver") return "text-gray-500 font-extrabold";
    if (tier === "Gold") return "text-yellow-600 font-extrabold";
    if (tier === "Platinum") return "text-cyan-600 font-extrabold";
    if (tier === "Diamond") return "text-indigo-600 font-extrabold";
    return "text-[#7C3AED] font-extrabold";
  };

  return (
    <div className="space-y-6">
      {/* Badges overview stats */}
      <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-lg font-extrabold text-[#1E1B4B] flex items-center gap-2">
            <Award size={22} className="text-yellow-500 animate-bounce" />
            Badge & Achievements System
          </h2>
          <p className="text-xs text-gray-500 font-semibold mt-1">
            Unlock achievements automatically by practicing consistently, pushing difficulties, and logging revisions.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-[#F8FAFC] p-4 rounded-xl border-2 border-[#E2E8F0] text-center min-w-[100px]">
            <div className="text-xl font-black text-[#7C3AED] font-mono">{user1Unlocked.length} / 14</div>
            <div className="text-[10px] text-gray-500 uppercase mt-1 font-extrabold">{currentUser.name}</div>
          </div>

          <div className="bg-[#F8FAFC] p-4 rounded-xl border-2 border-[#E2E8F0] text-center min-w-[100px]">
            <div className="text-xl font-black text-indigo-600 font-mono">{user2Unlocked.length} / 14</div>
            <div className="text-[10px] text-gray-500 uppercase mt-1 font-extrabold">{friendUser.name}</div>
          </div>
        </div>
      </div>

      {/* Rarity filter row */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-xl max-w-max">
        {["All", "Common", "Uncommon", "Rare", "Epic", "Legendary"].map((rarity) => (
          <button
            key={rarity}
            onClick={() => setSelectedRarity(rarity)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-all font-bold cursor-pointer ${
              selectedRarity === rarity
                ? "bg-[#7C3AED] text-white font-extrabold shadow-sm"
                : "text-gray-500 hover:text-[#1E1B4B] hover:bg-white"
            }`}
          >
            {rarity}
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {catalog.map((badge) => {
          const isUnlockedByAny = badge.u1Unlocked || badge.u2Unlocked;
          return (
            <div
              key={badge.id}
              className={`border rounded-2xl p-5 shadow-md flex gap-4 transition-all relative overflow-hidden ${
                isUnlockedByAny
                  ? "bg-white border-b-4 border-r-4 border-[#E2E8F0] hover:border-[#7C3AED] hover:shadow-lg"
                  : "bg-[#F8FAFC] border-2 border-dashed border-[#E2E8F0] opacity-60"
              }`}
            >
              {/* Background radial glow if unlocked */}
              {isUnlockedByAny && (
                <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-gradient-to-tr from-violet-500/5 to-transparent blur-xl rounded-full pointer-events-none" />
              )}

              {/* Badge Icon column */}
              <div className="flex flex-col items-center justify-start gap-2">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner relative border-2 ${
                  isUnlockedByAny 
                    ? "bg-[#F8FAFC] border-[#E2E8F0]" 
                    : "bg-gray-100 border-dashed border-gray-300 text-gray-400"
                }`}>
                  {isUnlockedByAny ? badge.icon : <Lock size={20} className="text-gray-400" />}
                </div>
                <span className={`text-[9px] font-extrabold uppercase tracking-wider font-mono ${getTierColor(badge.tier)}`}>
                  {badge.tier}
                </span>
              </div>

              {/* Badge Details column */}
              <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-extrabold text-sm text-[#1E1B4B] leading-tight">{badge.name}</h4>
                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded border font-mono ${getRarityBadgeColor(badge.rarity)}`}>
                      {badge.rarity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-semibold mt-1 leading-snug">{badge.description}</p>
                </div>

                <div className="pt-2.5 border-t-2 border-[#E2E8F0] flex flex-wrap gap-1.5 items-center text-[10px] font-bold">
                  <span className="text-gray-400">Unlocked:</span>
                  {badge.u1Unlocked && (
                    <span className="bg-[#F5F3FF] text-[#7C3AED] px-1.5 py-0.5 rounded border-2 border-[#E0D8FF] font-black font-mono">
                      {currentUser.name}
                    </span>
                  )}
                  {badge.u2Unlocked && (
                    <span className="bg-[#EEF2FF] text-indigo-700 px-1.5 py-0.5 rounded border-2 border-[#D2D6FF] font-black font-mono">
                      {friendUser.name}
                    </span>
                  )}
                  {!badge.u1Unlocked && !badge.u2Unlocked && (
                    <span className="text-gray-400 italic">No one yet</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
