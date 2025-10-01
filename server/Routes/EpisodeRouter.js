import express from "express";
import { protect, admin } from "../middlewares/Auth.js";
import {
    getEpisode,
    updateEpisode,
    deleteEpisode,
} from "../Controllers/EpisodeController.js";

const router = express.Router();

router.get("/:id", getEpisode);
router.put("/:id", protect, admin, updateEpisode);
router.delete("/:id", protect, admin, deleteEpisode);

export default router;
