// app/services/FollowService.ts
import ApiClient from "@/app/ApiCore";

const api = new ApiClient();

export type FollowTargetType = "book" | "author";

export const FollowService = {
  follow: (targetType: FollowTargetType, targetId: string) =>
    api.post<{ data: { following: boolean } }>("/api/follows", { targetType, targetId }),
  unfollow: (targetType: FollowTargetType, targetId: string) =>
    api.delete<{ data: { following: boolean } }>(
      `/api/follows?targetType=${targetType}&targetId=${targetId}`
    ),
};