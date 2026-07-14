/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/lib/serialize-comment.ts (or wherever it lives) — add near the top
import type { Types } from "mongoose";

interface PopulatedCommentAuthor {
  _id: Types.ObjectId;
  name?: string;
  username: string;
  avatarUrl?: string | null;
}

// The shape a comment actually has AFTER .populate("userId", "name username avatarUrl").lean()
export interface PopulatedCommentDoc {
  _id: Types.ObjectId;
  chapterId: Types.ObjectId;
  bookId: Types.ObjectId;
  userId: PopulatedCommentAuthor; // ← not Types.ObjectId here, this is the point
  parentId: Types.ObjectId | null;
  paragraphIndex: number | null;
  content: string;
  repliesCount?: number;
  createdAt: Date;
  updatedAt: Date;
  // add any other fields your Comment schema actually has
}

// Turns a lean/populated Comment mongoose doc into the DTO shape the
// frontend expects. Kept in one place so the comments-list, replies-list,
// and create-comment routes can't drift out of sync with each other.
export function serializeComment(c: any, likedIds: Set<string>,authorId?: string) {
  const userId = c.userId?._id ? String(c.userId._id) : String(c.userId)
  return {
    _id: String(c._id),
    chapterId: String(c.chapterId),
    parentId: c.parentId ? String(c.parentId) : null,
    paragraphIndex: c.paragraphIndex ?? null,
    content: c.content,
    likesCount: c.likesCount ?? 0,
    repliesCount: c.repliesCount ?? 0,
    likedByMe: likedIds.has(String(c._id)),
    edited: Boolean(c.edited),
    createdAt: c.createdAt,
    isAuthor: !!authorId && userId === authorId,
    user: c.userId
      ? {
          _id: String(c.userId._id ?? c.userId),
          name: c.userId.name ?? c.userId.username ?? "Reader",
          avatarUrl: c.userId.avatarUrl ?? null,
        }
      : null,
  };
}