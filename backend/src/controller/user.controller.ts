import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import userService from "../service/user.service.js";
import type { PatchMeBody } from "../models/user.model.js";

class UserController {
  getMe = catchAsync(async (req: Request, res: Response) => {
    const user = await userService.getMe(req.user!.id);
    res.json({ success: true, data: user });
  });

  updateMe = catchAsync(async (req: Request, res: Response) => {
    const user = await userService.updateMe(req.user!.id, req.body as PatchMeBody);
    res.json({ success: true, data: user });
  });

  getByUsername = catchAsync(async (req: Request, res: Response) => {
    const user = await userService.getByUsername(String(req.params.username));
    res.json({ success: true, data: user });
  });

  getMySubmissions = catchAsync(async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const { submissions, total } = await userService.getMySubmissions(req.user!.id, { page, limit });
    res.json({ success: true, data: submissions, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  });

  getMyReviews = catchAsync(async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const { reviews, total } = await userService.getMyReviews(req.user!.id, { page, limit });
    res.json({ success: true, data: reviews, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  });

  getMyReviewsReceived = catchAsync(async (req: Request, res: Response) => {
    const { page, limit } = req.query as unknown as { page: number; limit: number };
    const { reviews, total } = await userService.getMyReviewsReceived(req.user!.id, { page, limit });
    res.json({ success: true, data: reviews, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  });
}

export default new UserController();
