import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type SignInFormValues = z.infer<typeof signInSchema>;


export const signUpSchema = signInSchema;

export type SignUpFormValues = z.infer<typeof signUpSchema>;
