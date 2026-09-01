import { z } from "zod";

export const conversationIdParamSchema = z.object({
  conversationId: z.uuid("Invalid conversation ID format"),
});

export const sendMessageSchema = z.object({
  type: z.enum(["text", "image", "file"]).default("text"),
  content: z.string().min(1, "Message content cannot be empty"),
});

export const sendMessageSocketSchema = z.object({
  conversationId: z.uuid("Invalid conversation ID format"),
  type: z.enum(["text", "image", "file"]).default("text"),
  content: z.string().min(1, "Message content cannot be empty"),
});
