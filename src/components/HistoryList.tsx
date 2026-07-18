/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, Filter, Trash2, Calendar, BookOpen, ExternalLink } from "lucide-react";
import { QuestionLog, DSATopic, Difficulty, Platform } from "../types";
import { DSA_TOPICS, PLATFORMS } from "../lib/dsaUtils";

interface HistoryListProps {
  questions: QuestionLog[];
  userNames: Record<string, string>;
  onDeleteQuestion: (id: string) => void;
}

export default function HistoryList({ questions, userNames, onDeleteQuestion }: HistoryListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("All");
  const [selectedUser, setSelectedUser] = useState<string>("All");

  // Filter logs
  const filteredQuestions = [...questions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // sorted by newest
    .filter((q) => {
      const matchSearch = q.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (q.note && q.note.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchTopic = selectedTopic === "All" || q.topic === selectedTopic;
      const matchDiff = selectedDifficulty === "All" || q.difficulty === selectedDifficulty;
      const matchPlat = selectedPlatform === "All" || q.platform === selectedPlatform;
      const matchUser = selectedUser === "All" || q.userId === selectedUser;

      return matchSearch && matchTopic && matchDiff && matchPlat && matchUser;
    });

  return (
    <div className="bg-white border-b-4 border-r-4 border-[#E2E8F0] rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-extrabold text-[#1E1B4B] flex items-center gap-2">
            <BookOpen size={20} className="text-[#7C3AED]" />
            Solved Questions History
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Search, filter, and inspect revision dates, learning notes, or remove logs.
          </p>
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search questions or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 bg-[#F8FAFC] border-2 border-[#E2E8F0] text-[#1E293B] rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] focus:outline-none font-semibold"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-[#F8FAFC] p-3 rounded-xl border-2 border-[#E2E8F0] mb-6">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 pl-1">
            User
          </label>
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full bg-white border-2 border-[#E2E8F0] text-[#1E293B] rounded-lg p-1.5 text-xs focus:outline-none focus:border-[#7C3AED] font-bold"
          >
            <option value="All">All Users</option>
            {Object.entries(userNames).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 pl-1">
            Topic
          </label>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full bg-white border-2 border-[#E2E8F0] text-[#1E293B] rounded-lg p-1.5 text-xs focus:outline-none focus:border-[#7C3AED] font-bold"
          >
            <option value="All">All Topics</option>
            {DSA_TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 pl-1">
            Difficulty
          </label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full bg-white border-2 border-[#E2E8F0] text-[#1E293B] rounded-lg p-1.5 text-xs focus:outline-none focus:border-[#7C3AED] font-bold"
          >
            <option value="All">All Diff</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 pl-1">
            Platform
          </label>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="w-full bg-white border-2 border-[#E2E8F0] text-[#1E293B] rounded-lg p-1.5 text-xs focus:outline-none focus:border-[#7C3AED] font-bold"
          >
            <option value="All">All Sites</option>
            {PLATFORMS.map((plat) => (
              <option key={plat} value={plat}>
                {plat}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-2 md:col-span-1 flex items-end justify-end">
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedTopic("All");
              setSelectedDifficulty("All");
              setSelectedPlatform("All");
              setSelectedUser("All");
            }}
            className="text-[10px] text-gray-500 hover:text-[#7C3AED] font-bold uppercase tracking-wider px-2.5 py-2 bg-white hover:bg-gray-100 border-2 border-[#E2E8F0] rounded-xl transition-all w-full md:w-auto text-center cursor-pointer shadow-xs"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* History List or Empty state */}
      {filteredQuestions.length === 0 ? (
        <div className="text-center py-10 bg-[#F8FAFC] rounded-xl border-2 border-dashed border-[#E2E8F0]">
          <p className="text-gray-400 text-sm italic font-medium">No matching questions logged in history.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="bg-white border-2 border-[#E2E8F0] rounded-xl p-4 hover:border-[#7C3AED] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative group"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs bg-[#F5F3FF] text-[#7C3AED] border-2 border-[#E0D8FF] px-2 py-0.5 rounded font-extrabold uppercase">
                    {userNames[q.userId] || "Unknown User"}
                  </span>
                  <h3 className="font-extrabold text-sm text-[#1E1B4B]">{q.name}</h3>

                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${
                    q.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : q.difficulty === "Medium" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"
                  }`}>
                    {q.difficulty}
                  </span>

                  {q.isRevision ? (
                    <span className="bg-cyan-50 text-cyan-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-cyan-200 uppercase">
                      REVISION
                    </span>
                  ) : (
                    <span className="bg-violet-50 text-[#7C3AED] text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-violet-200 uppercase">
                      NEW
                    </span>
                  )}

                  {q.isDailyChallenge && (
                    <span className="bg-[#FEF08A] text-amber-800 text-[10px] font-black px-1.5 py-0.5 rounded border border-amber-300">
                      ★ CHALLENGE BONUS
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1">
                    <span className="text-[#7C3AED] font-extrabold">Topic:</span> {q.topic}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="text-[#7C3AED] font-extrabold">Site:</span> {q.platform}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-bold text-gray-600">
                    <Calendar size={12} /> {q.date}
                  </span>
                </div>

                {q.note && (
                  <p className="text-xs text-gray-700 italic bg-[#F8FAFC] border-l-4 border-[#7C3AED] p-3 rounded-r-xl mt-2 font-medium">
                    "{q.note}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                <div className="text-right">
                  <span className="text-[11px] font-black text-emerald-600 font-mono">
                    +{q.points} Points
                  </span>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to remove "${q.name}"?`)) {
                      onDeleteQuestion(q.id);
                    }
                  }}
                  className="p-2 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all border-2 border-[#E2E8F0] cursor-pointer shadow-xs"
                  title="Delete Entry"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
