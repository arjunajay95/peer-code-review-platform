import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import technologyService from "../service/technology.service.js";

class TechnologyController {
  getAll = catchAsync(async (_req: Request, res: Response) => {
    const technologies = await technologyService.getAll();
    res.json({ success: true, data: technologies });
  });
}

export default new TechnologyController();
