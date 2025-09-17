import express from "express";
import { protect, admin } from "../middlewares/Auth.js";
import * as watchController from "../Controllers/WatchController.js";

const router = express.Router();

// *********PRIVATE ROUTES****************
// ghi nhận tiến độ
router.post("/", protect, watchController.upsertWatch);

// Kiểm tra router mount
router.get("/ping", (req, res) => {
    res.json({ ok: true, route: "/api/watch/ping" });
});

// Kiểm tra protect + req.user
router.get("/__debug", protect, (req, res) => {
    res.json({ ok: true, user: req.user || null });
});


// tiếp tục xem / đã xem gần đây / trạng thái resume
router.get("/me/continue", protect, watchController.getContinueWatching);
router.get("/me/recent", protect, watchController.getRecentlyWatched);
router.get("/me/state", protect, watchController.getPlaybackState);

// xoá lịch sử
router.delete("/me/:movieId", protect, watchController.deleteOnePlayback);
router.delete("/me", protect, watchController.clearAllPlayback);

// ***********ADMIN ROUTES (tùy chọn)********************
router.get("/admin/top", protect, admin, watchController.adminTopWatched);

export default router;
