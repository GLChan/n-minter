import React from "react";

export default function TimeRangeButton({
  range,
  label,
  currentTimeRange,
}: {
  range: string;
  label: string;
  currentTimeRange: string;
}) {
  return (
    <button
      className={`px-4 py-2 rounded-full text-sm cursor-pointer ${
        range === currentTimeRange
          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
          : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
      }`}
    >
      {label}
    </button>
  );
}
