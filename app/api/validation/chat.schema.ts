// app/api/validation/chat.schema.ts
import { z } from "zod";

export const startConversationSchema = z.object({
  username: z.string().min(1),
});

export const sendMessageSchema = z.object({
  body: z.string().trim().min(1, "Message can't be empty").max(2000, "Message is too long"),
});

export const editMessageSchema = z.object({
  body: z.string().trim().min(1, "Message can't be empty").max(2000, "Message is too long"),
});