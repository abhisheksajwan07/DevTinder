import z from "zod";

export const oauthCallbackSchema = z.object({
  code: z.string().optional(),
  state: z.string().optional(),
  error: z.string().optional(),
});

export type OAuthCallbackDTO = z.infer<typeof oauthCallbackSchema>;



