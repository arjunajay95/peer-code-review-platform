import { z } from "zod";

// Response shape for GET /users/me and GET /users/:username.
// clerkId is never in any select so it never reaches here (D-08, V-07).
export const userProfileSchema = z.object({
  id: z.number(),
  username: z.string(),
  bio: z.string().nullable(),
  githubUrl: z.string().nullable(),
  karma: z.number(),
  createdAt: z.string(),
});

// PATCH /users/me, local fields only.
// Identity fields (id, clerkId, karma, createdAt, updatedAt) are absent
// entirely from this schema, not just optional (V-11).
// .strict() rejects any key not listed here (D-11).
export const patchMeBodySchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(/^[a-z0-9_]+$/, "Username may only contain lowercase letters, numbers, and underscores")
      .optional(),
    bio: z.string().max(300, "Bio must be at most 300 characters").nullable().optional(),
    githubUrl: z
      .string()
      .url("Must be a valid URL")
      .startsWith("https://github.com/", "Must be a github.com URL")
      .nullable()
      .optional(),
    technologyIds: z
      .array(z.number().int().positive())
      .max(10, "At most 10 technologies")
      .optional(),
  })
  .strict();

export type PatchMeBody = z.infer<typeof patchMeBodySchema>;
