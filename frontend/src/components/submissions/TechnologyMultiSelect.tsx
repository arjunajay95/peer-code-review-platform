"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { Technology } from "@/types/submission";

// Consumes Member A's GET /technologies route (public, no auth). Never
// reimplemented here, this component only reads the list (TEAM_SCOPE_B §3).
interface TechnologyMultiSelectProps {
  value: string[];
  onChange: (next: string[]) => void;
  error?: string;
}

export default function TechnologyMultiSelect({ value, onChange, error }: TechnologyMultiSelectProps) {
  const [options, setOptions] = useState<Technology[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    api
      .get<Technology[]>("/technologies")
      .then(({ data }) => setOptions(data))
      .catch(() => setOptions([]));
  }, []);

  const addTag = (raw: string) => {
    const tag = raw.trim().toLowerCase();
    if (!tag) return;
    if (value.includes(tag)) return;
    if (value.length >= 8) return;
    onChange([...value, tag]);
    setInput("");
  };

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

  const suggestions = options
    .map((o) => o.name)
    .filter((name) => name.includes(input.trim().toLowerCase()) && !value.includes(name))
    .slice(0, 6);

  return (
    <div>
      <div className="flex flex-wrap gap-2 border border-zinc-300 bg-white px-3 py-2 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove ${tag}`}
              className="text-indigo-400 hover:text-indigo-700"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag(input);
            } else if (e.key === "Backspace" && !input && value.length) {
              removeTag(value[value.length - 1]);
            }
          }}
          placeholder={value.length === 0 ? "Type a technology and press Enter (e.g. react)" : ""}
          className="min-w-[8rem] flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400 dark:text-zinc-50"
        />
      </div>

      {input.trim() && suggestions.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {suggestions.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => addTag(name)}
              className=" border border-zinc-200 px-2.5 py-0.5 text-xs text-zinc-600 hover:border-indigo-300 hover:text-indigo-700 dark:border-zinc-700 dark:text-zinc-400"
            >
              + {name}
            </button>
          ))}
        </div>
      )}

      <p className="mt-1 text-xs text-zinc-400">{value.length} / 8 technologies</p>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
