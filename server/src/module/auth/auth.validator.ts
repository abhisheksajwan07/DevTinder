import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email("Invalid email").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(70, "Password can't be more than 70 characters "),
});

export type SignUpDto = z.infer<typeof signUpSchema>;
