"use client";

import { useEffect, useState } from "react";

const KEY = "idoh_recently_viewed";
const MAX = 4;

export function useRecentlyViewed(currentId: string) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const stored: string[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    const updated = [currentId, ...stored.filter(id => id !== currentId)].slice(0, MAX + 1);
    localStorage.setItem(KEY, JSON.stringify(updated));
    setIds(updated.filter(id => id !== currentId).slice(0, MAX));
  }, [currentId]);

  return ids;
}
