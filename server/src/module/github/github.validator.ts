import { z } from "zod";

export const featuredRepositoriesSchema = z.object({
  repositoryIds: z
    .array(z.string().uuid("Each repository ID must be a valid UUID"))
    .max(3, "You can feature a maximum of 3 repositories"),
});
