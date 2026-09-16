import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import submissionService from "../service/submission.service.js";
import type { CreateSubmissionBody, UpdateSubmissionBody } from "../models/submission.model.js";

class SubmissionController {
  create = catchAsync(async (req: Request, res: Response) => {
    const body = req.body as CreateSubmissionBody;
    const submission = await submissionService.create(req.user!.id, body);

    res.status(201).json({
      success: true,
      data: submission,
    });
  });

  getById = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params as unknown as { id: number };
    const submission = await submissionService.getById(id);

    res.json({
      success: true,
      data: submission,
    });
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params as unknown as { id: number };
    const body = req.body as UpdateSubmissionBody;

    const submission = await submissionService.update(id, req.user!.id, body);

    res.json({
      success: true,
      data: submission,
    });
  });

  getTrendingReviewed = catchAsync(async (req: Request, res: Response) => {
    const trending = await submissionService.getTrendingReviewed(req.user!.id);

    res.json({
      success: true,
      data: trending,
    });
  });
}

export default new SubmissionController();
