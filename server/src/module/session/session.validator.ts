import { z } from "zod";

export const revokeSessionParamsSchema = z.object({
  sessionId: z.uuid(),
});