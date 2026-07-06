import ApiClient from "@/app/ApiCore";

const api = new ApiClient();

export interface ParagraphCommentDTO {
  id: string;
  chapterId: string;
  paragraphIndex: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  body: string;
  helpfulVotes: number;
  lovedByMe: boolean;
  parentId: string | null;
  replyCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentBody {
  paragraphIndex: number;
  body: string;
  parentId?: string;
}

export interface CommentUserDTO {
  _id: string;
  name: string;
  avatarUrl: string | null;
}
 
export interface CommentDTO {
  _id: string;
  chapterId: string;
  parentId: string | null;
  paragraphIndex: number | null;
  content: string;
  likesCount: number;
  repliesCount: number;
  likedByMe: boolean;
  edited: boolean;
  createdAt: string;
  user: CommentUserDTO | null;
}
 
// Kept for backward compatibility with existing usage (ParagraphCommentPanel).

 
export interface PaginatedComments {
  comments?: CommentDTO[];
  replies?: CommentDTO[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export const CommentService = {
  getCounts: (chapterId: string | null) =>
    api.get<{ success: boolean; data: { counts: Record<string, number> } }>(
      `/api/books/chapters/${chapterId}/comments/counts`
    ),

  getForParagraph: (chapterId: string | null, paragraphIndex: number, skip = 0, limit = 10) =>
    api.get<{
      success: boolean;
      data: { comments: ParagraphCommentDTO[]; total: number; hasMore: boolean };
    }>(`/api/books/chapters/${chapterId}/comments?paragraphIndex=${paragraphIndex}&skip=${skip}&limit=${limit}`),

  getReplies: (chapterId: string | null, commentId: string) =>
    api.get<{ success: boolean; data: { replies: ParagraphCommentDTO[] } }>(
      `/api/books/chapters/${chapterId}/comments/${commentId}/replies`
    ),

  create: (chapterId: string | null, body: CreateCommentBody) =>
    api.post<{ success: boolean; data: { comment: ParagraphCommentDTO } }>(
      `/api/books/chapters/${chapterId}/comments`,
      body
    ),

  // Toggle — call the same way whether loving or unloving; server decides
  // based on current state and tells you which happened via lovedByMe.
  love: (chapterId: string | null, commentId: string) =>
    api.post<{
      success: boolean;
      data: { comment: { id: string; helpfulVotes: number; lovedByMe: boolean } };
    }>(`/api/books/chapters/${chapterId}/comments/${commentId}/love`, {}),

  update: (chapterId: string | null, commentId: string, body: string) =>
    api.patch<{
      success: boolean;
      data: { comment: { id: string; body: string; updatedAt: string } };
    }>(`/api/books/chapters/${chapterId}/comments/${commentId}`, { body }),

  remove: (chapterId: string | null , commentId: string) =>
    api.delete<{ success: boolean; data: { deletedId: string; cascaded: boolean } }>(
      `/api/books/chapters/${chapterId}/comments/${commentId}`
    ),

  getChapterComments(chapterId: string, page = 1, limit = 10) {
    return api.get<{data:PaginatedComments}>(`/api/chapters/${chapterId}/comments`, {
      params: { page, limit },
    });
  },
 
  postComment(chapterId: string, content: string, parentId?: string | null) {
    return api.post<{ data:{comment: CommentDTO} }>(`/api/chapters/${chapterId}/comments`, {
      content,
      parentId: parentId ?? null,
    });
  },
 
  getCommentReplies(commentId: string, page = 1, limit = 10) {
    return api.get<{data:PaginatedComments}>(`/api/comments/${commentId}/replies`, {
      params: { page, limit },
    });
  },
 
  toggleCommentLike(commentId: string) {
    return api.post<{ data:{liked: boolean; likesCount: number} }>(`/api/comments/${commentId}/like`);
  },
 
  deleteComment(commentId: string) {
    return api.delete<{ success: boolean }>(`/api/comments/${commentId}`);
  },
};