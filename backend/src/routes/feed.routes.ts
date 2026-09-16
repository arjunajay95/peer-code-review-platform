import { Router } from "express";
import { feedController } from "../controller/feed.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import requireAuth from "../middlewares/requireAuth.js";
import { feedQuerySchema } from "../models/feed.model.js";

const router = Router();

router.get("/personalized", requireAuth, validate(feedQuerySchema), feedController.getPersonalizedFeed);
router.get("/", validate(feedQuerySchema), feedController.getPublicFeed);

export default router;
