import { z } from "zod";

const oauthEnvSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GITHUB_REDIRECT_URI: z.string().min(1),
  GITHUB_CONNECT_REDIRECT_URI: z.string().min(1).optional(),
});

const parsed = oauthEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Missing OAuth environment variables:",
    z.treeifyError(parsed.error),
  );
  process.exit(1);
}

export const oauthEnv = parsed.data;
