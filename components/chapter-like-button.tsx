"use client";

import { useEffect, useState } from "react";
import { ChapterService } from "@/app/services/ChapterService";
import { LikeButton } from "@/components/like-button";

export function ChapterLikeButton({ chapterId }: { chapterId: string }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [pending, setPending] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    ChapterService.getLikeStatus(chapterId)
      .then(({ data }) => {
        if (cancelled) return;
        setLiked(data.liked);
        setCount(data.likesCount);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [chapterId]);

  async function handleToggle() {
    if (pending) return;
    setPending(true);

    const prevLiked = liked;
    const prevCount = count;
    setLiked(!prevLiked);
    setCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const { data } = await ChapterService.toggleLike(chapterId);
      setLiked(data.liked);
      setCount(data.likesCount||0);
    } catch {
      // Roll back on failure (e.g. not signed in, or a network error).
      setLiked(prevLiked);
      setCount(prevCount||0);
    } finally {
      setPending(false);
    }
  }

  return <LikeButton liked={liked} count={count} onToggle={handleToggle} disabled={!loaded || pending} />;
}