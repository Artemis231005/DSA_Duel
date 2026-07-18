/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { PlusCircle, Info, Check, HelpCircle, Save } from "lucide-react";
import { DSATopic, Difficulty, Platform } from "../types";
import { DSA_TOPICS, PLATFORMS } from "../lib/dsaUtils";

interface QuestionLoggerProps {
  userId: string;
  userName: string;
  onLogQuestion: (question: {
    name: string;
    platform: string;
    topic: DSATopic;
    difficulty: Difficulty;
    isRevision: boolean;
    note?: string;
    date: string;
  }) => void;
}

export default function QuestionLogger({ userId, userName, onLogQuestion }: QuestionLoggerProps) {
  const [name, setName] = useState("");
  const [platform, setPlatform] = useState("LeetCode");
  const [customPlatform, setCustomPlatform] = useState("");
  const [topic, setTopic] = useState<DSATopic>("Arrays & Hashing");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [isRevision, setIsRevision] = useState(false);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!name.trim()) {
      setError("Please specify a question name!");
      return;
    }

    const finalPlatform = platform === "Other" && customPlatform.trim() ? customPlatform.trim() : platform;

    onLogQuestion({
      name: name.trim(),
      platform: finalPlatform,
      topic,
      difficulty,
      isRevision,
      note: note.trim() || undefined,
      date,
    });

    // Reset Form
    setName("");
    setNote("");
    setIsRevision(false);
    setSuccessMsg("Question logged successfully! Statistics updated.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const getPointsEstimate = () => {
    if (difficulty === "Easy") return isRevision ? 2 : 5;
    if (difficulty === "Medium") return isRevision ? 4 : 10;
    return isRevision ? 6 : 15;
  };

  return (
    <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-6 shadow-xl max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <PlusCircle className="text-[#7C3AED]" size={22} />
        <h2 className="text-lg font-extrabold text-[#1E1B4B]">Log Solved Question</h2>
      </div>

      <p className="text-xs text-gray-500 mb-6">
        Recording for <span className="text-[#7C3AED] font-bold font-mono">{userName}</span>. Submitting recalculates scores and checks badges automatically.
      </p>

      {error && (
        <div className="mb-4 bg-red-50 border-2 border-red-200 text-red-600 text-xs rounded-xl p-3 flex items-center gap-2">
          <Info size={14} />
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 bg-emerald-50 border-2 border-emerald-200 text-emerald-700 text-xs rounded-xl p-3 flex items-center gap-2">
          <Check size={14} />
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Question Name
          </label>
          <input
            type="text"
            placeholder="e.g. 3Sum, Valid Palindrome, Word Search"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] text-[#1E293B] rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Easy", "Medium", "Hard"] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`py-2 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
                    difficulty === diff
                      ? diff === "Easy"
                        ? "bg-[#EFFDF5] border-emerald-500 text-emerald-700"
                        : diff === "Medium"
                        ? "bg-[#FFFDF2] border-amber-500 text-amber-700"
                        : "bg-[#FDF2F2] border-red-500 text-red-700"
                      : "bg-[#F8FAFC] border-[#E2E8F0] text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Practice Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsRevision(false)}
                className={`py-2 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
                  !isRevision
                    ? "bg-[#F5F3FF] border-[#7C3AED] text-[#7C3AED]"
                    : "bg-[#F8FAFC] border-[#E2E8F0] text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                New Question
              </button>
              <button
                type="button"
                onClick={() => setIsRevision(true)}
                className={`py-2 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
                  isRevision
                    ? "bg-[#F5F3FF] border-[#7C3AED] text-[#7C3AED]"
                    : "bg-[#F8FAFC] border-[#E2E8F0] text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                Revision Log
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              DSA Topic
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value as DSATopic)}
              className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] text-[#1E293B] rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] focus:outline-none"
            >
              {DSA_TOPICS.map((t) => (
                <option key={t} value={t} className="bg-white text-[#1E293B]">
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Solved Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] text-[#1E293B] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Platform / Site
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {PLATFORMS.map((plat) => (
              <button
                key={plat}
                type="button"
                onClick={() => setPlatform(plat)}
                className={`text-[11px] font-medium px-2.5 py-1.5 rounded-lg border-2 transition-all cursor-pointer ${
                  platform === plat
                    ? "bg-[#F5F3FF] border-[#7C3AED] text-[#7C3AED]"
                    : "bg-[#F8FAFC] border-[#E2E8F0] text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {plat}
              </button>
            ))}
          </div>

          {platform === "Other" && (
            <input
              type="text"
              placeholder="Enter platform name"
              value={customPlatform}
              onChange={(e) => setCustomPlatform(e.target.value)}
              className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] text-[#1E293B] rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] focus:outline-none"
            />
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-bold text-slate-700">
              Learning Note & Key Observations (Optional)
            </label>
            <span className="text-[10px] text-gray-400 font-mono">
              {note.length} chars
            </span>
          </div>
          <textarea
            rows={3}
            placeholder="Write down the space/time complexity, tricky edge cases, or what you learned... Tip: Logs over 80 characters unlock funny badges!"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-[#F8FAFC] border-2 border-[#E2E8F0] text-[#1E293B] rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] focus:outline-none resize-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-extrabold text-xs py-3 rounded-xl transition-all border-b-4 border-r-4 border-purple-800 active:border-b-0 active:border-r-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-purple-100"
          >
            <Save size={16} />
            Log Question (+{getPointsEstimate()} points)
          </button>
        </div>
      </form>
    </div>
  );
}
