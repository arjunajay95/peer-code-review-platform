import { z } from "zod";

// Thin, UX-level schemas for the submission forms (D-02, D-22).
// Intentionally looser than backend/src/models/submission.model.ts and
// never stricter in ways that could block valid input, the backend is
// the authority, this is just fast client-side feedback.
// Never import across the frontend/backend boundary (V-19); this is a
// deliberate duplication, not a shared module.

export const criterionFieldSchema = z.object({
  label: z.string().trim().min(1, "Criterion label is required").max(100, "Max 100 characters"),
});

const submissionSharedFields = {
  title: z.string().trim().min(1, "Title is required").max(150, "Max 150 characters"),
  description: z.string().trim().min(1, "Description is required").max(5000, "Max 5000 characters"),
  githubUrl: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .startsWith("https://github.com/", "Must be a github.com URL"),
  technologies: z
    .array(z.string().trim().min(1))
    .min(1, "Add at least 1 technology")
    .max(8, "At most 8 technologies"),
};

// /submissions/new (B-10)
export const createSubmissionFormSchema = z.object({
  ...submissionSharedFields,
  criteria: z.array(criterionFieldSchema).min(1, "Add at least 1 criterion").max(5, "At most 5 criteria"),
});

export type CreateSubmissionFormValues = z.infer<typeof createSubmissionFormSchema>;

// /submissions/[id]/edit (B-13), no criteria field at all, criteria are
// locked forever once the submission is created (D-03).
export const updateSubmissionFormSchema = z.object(submissionSharedFields);

export type UpdateSubmissionFormValues = z.infer<typeof updateSubmissionFormSchema>;
