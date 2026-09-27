import type { ConversationCursor, MessageCursor } from "./chat.types.js";

export const PARTICIPANTS_TTL_SECONDS = 60 * 60 * 24; // 24 hours
export const DEFAULT_PAGE_SIZE = 20;
export const DEFAULT_MESSAGE_PAGE_SIZE = 50;

export function encodeCursor(cursor: ConversationCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64");
}

export function decodeCursor(raw: string): ConversationCursor | null {
  try {
    return JSON.parse(
      Buffer.from(raw, "base64").toString("utf8"),
    ) as ConversationCursor;
  } catch {
    return null;
  }
}

export function encodeMessageCursor(cursor: MessageCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64");
}

export function decodeMessageCursor(raw: string): MessageCursor | null {
  try {
    return JSON.parse(
      Buffer.from(raw, "base64").toString("utf8"),
    ) as MessageCursor;
  } catch {
    return null;
  }
}
