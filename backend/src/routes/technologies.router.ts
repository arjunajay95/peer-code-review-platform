import { Router } from "express";
import technologyController from "../controller/technology.controller.js";

const router = Router();

// GET /api/technologies, public, no auth required (D-17).
router.get("/", technologyController.getAll);

export default router;
