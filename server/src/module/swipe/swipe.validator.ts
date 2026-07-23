import { z } from "zod";

export const ProfileIdSchema = z.object({
  profileId: z.uuid(),
});

