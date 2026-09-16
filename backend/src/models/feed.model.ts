import { z } from "zod";

export const feedQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)).pipe(z.number().min(1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)).pipe(z.number().min(1).max(50)),
    search: z.string().optional(),
    technologies: z.string().optional(),
    debug: z.string().optional().transform((val) => val === '1'), // Will be used in C-05/C-06, keeping it here for now
  }).strict()
});

export type FeedQuery = z.infer<typeof feedQuerySchema>['query'];
