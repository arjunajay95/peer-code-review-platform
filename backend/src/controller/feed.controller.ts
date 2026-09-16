import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { feedService } from "../service/feed.service.js";
import { FeedQuery } from "../models/feed.model.js";

class FeedController {
  getPublicFeed = catchAsync(async (req: Request, res: Response) => {
    // req.query is already validated and typed by the middleware
    const query = req.query as unknown as FeedQuery;
    
    const { items, meta } = await feedService.getPublicFeed(query);

    res.json({
      success: true,
      data: items,
      meta
    });
  });

  getPersonalizedFeed = catchAsync(async (req: Request, res: Response) => {
    // req.query is validated
    const query = req.query as unknown as FeedQuery;
    // req.user is set by requireAuth
    const userId = req.user!.id;

    const { items, meta } = await feedService.getPersonalizedFeed(query, userId);

    res.json({
      success: true,
      data: items,
      meta
    });
  });
}

export const feedController = new FeedController();
