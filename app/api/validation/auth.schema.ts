import { z } from "zod";

const MIN_SIGNUP_AGE = 13;

function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or username"),
  password: z.string().min(1, "Enter your password"),
});

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  displayName: z.string().trim().max(60).optional(),
  dateOfBirth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Enter a valid date of birth")
    .refine(
      (val) => calculateAge(new Date(val)) >= MIN_SIGNUP_AGE,
      `You must be at least ${MIN_SIGNUP_AGE} to join Lore`
    ),
  marketingOptIn: z.boolean().default(false),
  // z.literal's second argument is a RawCreateParams object, not a raw
  // string — that mismatch is what TypeScript was flagging.
  agreedToTerms: z.literal(true, { message: "You must accept the Terms and Privacy Policy" }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;