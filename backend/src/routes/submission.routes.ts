import { Router } from "express";
import requireAuth from "../middlewares/requireAuth.js";
import { writeLimiter } from "../middlewares/rateLimiter.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createSubmissionSchema, getSubmissionSchema, updateSubmissionSchema } from "../models/submission.model.js";
import submissionController from "../controller/submission.controller.js";
import { createReviewSchema } from "../models/review.model.js";
import reviewController from "../controller/review.controller.js";

const router = Router();

router.post("/", requireAuth, writeLimiter, validate(createSubmissionSchema), submissionController.create);

router.get("/me/trending-reviewed", requireAuth, submissionController.getTrendingReviewed);

router.get("/:id", validate(getSubmissionSchema), submissionController.getById);

router.put("/:id", requireAuth, writeLimiter, validate(updateSubmissionSchema), submissionController.update);

router.post("/:id/reviews", requireAuth, writeLimiter, validate(createReviewSchema), reviewController.create);

export default router;
