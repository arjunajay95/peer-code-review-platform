import { z } from "zod";

const technologyTag = z.string().trim().toLowerCase().min(1, "Technology tag cannot be empty");

const criterionInput = z
  .object({
    label: z.string().trim().min(1, "Criterion label is required").max(100, "Criterion label must be at most 100 characters"),
  })
  .strict();

const submissionEditableFields = {
  title: z.string().trim().min(1, "Title is required").max(150, "Title must be at most 150 characters"),
  description: z.string().trim().min(1, "Description is required").max(5000, "Description must be at most 5000 characters"),
  githubUrl: z.string().url("Must be a valid URL").startsWith("https://github.com/", "Must be a github.com URL"),
  technologies: z.array(technologyTag).min(1, "At least 1 technology is required").max(8, "At most 8 technologies"),
};

// POST /api/submissions - criteria only ever exist on creation
// No top-level .strict(): validate.middleware always passes body/query/params
// together, and this route only cares about body.
export const createSubmissionSchema = z.object({
  body: z
    .object({
      ...submissionEditableFields,
      criteria: z.array(criterionInput).min(1, "At least 1 criterion is required").max(5, "At most 5 criteria"),
    })
    .strict(),
});

// PUT /api/submissions/:id - no criteria key at all, not even optional
export const updateSubmissionSchema = z.object({
  params: z
    .object({
      id: z.coerce.number().int().positive(),
    })
    .strict(),
  body: z.object(submissionEditableFields).strict(),
});

export const getSubmissionSchema = z.object({
  params: z
    .object({
      id: z.coerce.number().int().positive(),
    })
    .strict(),
});

export type CreateSubmissionBody = z.infer<typeof createSubmissionSchema>["body"];
export type UpdateSubmissionBody = z.infer<typeof updateSubmissionSchema>["body"];
