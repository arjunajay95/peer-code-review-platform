import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import reviewService from "../service/review.service.js";
import type { CreateReviewBody } from "../models/review.model.js";

class ReviewController {
  create = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params as unknown as { id: number };
    const body = req.body as CreateReviewBody;

    const review = await reviewService.create(req.user!.id, id, body);

    res.status(201).json({
      success: true,
      data: review,
    });
  });
}

export default new ReviewController();
