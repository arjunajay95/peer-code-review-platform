import { z } from "zod";

// Thin, UX-level schema for the review form (D-02, D-22). Mirrors
// backend/src/models/review.model.ts but stays advisory only, the API
// re-enforces everything (self-review, criteria mismatch, duplicates).

export const reviewFormSchema = z.object({
  feedback: z.string().trim().min(10, "Feedback must be at least 10 characters").max(2000, "Max 2000 characters"),
  strengths: z.string().trim().min(5, "Describe at least one strength").max(1000, "Max 1000 characters"),
  improvements: z.string().trim().min(5, "Describe at least one improvement").max(1000, "Max 1000 characters"),
  resources: z.string().trim().max(500, "Max 500 characters").optional(),
  ratings: z
    .array(
      z.object({
        criterionId: z.number().int().positive(),
        rating: z.number().int().min(1, "Pick a rating").max(5, "Pick a rating"),
      }),
    )
    .min(1, "Rate at least 1 criterion"),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
