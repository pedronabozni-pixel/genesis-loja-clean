"use client";

import { useEffect, useState } from "react";
import type { SiteContent } from "@/types/store";

function getSecondsUntilEndOfDay() {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function ScarcityCountdown({ content }: { content: SiteContent["home"]["hero"] }) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    setSecondsLeft(getSecondsUntilEndOfDay());

    const timer = window.setInterval(() => {
      setSecondsLeft(getSecondsUntilEndOfDay());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  if (secondsLeft === null) {
    return (
      <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200">
        {content.countdownLoadingText}
      </p>
    );
  }

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  return (
    <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200">
      {content.countdownPrefix} {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </p>
  );
}
