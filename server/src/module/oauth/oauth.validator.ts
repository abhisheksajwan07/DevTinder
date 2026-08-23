import z from "zod";

export const oauthCallbackSchema = z.object({
  code: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  error: z.string().optional(),
});

export type OAuthCallbackDTO = z.infer<typeof oauthCallbackSchema>;
