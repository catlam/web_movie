import express from "express";
import { protect, admin } from "../middlewares/Auth.js";
import * as seriesController from "../Controllers/SeriesController.js";
import { listSeasonsOfSeries, createSeason } from "../Controllers/SeasonController.js";

const router = express.Router();

// Series
router.get("/", seriesController.listSeries);
router.get("/:id", seriesController.getSeries);
router.get("/:id/summary", seriesController.seriesSummary);
router.post("/", protect, admin, seriesController.createSeries);
router.put("/:id", protect, admin, seriesController.updateSeries);
router.delete("/:id", protect, admin, seriesController.deleteSeries);

router.post("/:id/reviews", protect, seriesController.createSeriesReview);
router.delete("/:id/reviews", protect, seriesController.deleteSeriesReview);

// Seasons under a Series
router.get("/:seriesId/seasons", listSeasonsOfSeries);
router.post("/:seriesId/seasons", protect, admin, createSeason);

export default router;
