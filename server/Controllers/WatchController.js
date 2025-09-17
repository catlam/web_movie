// Controllers/WatchController.js
import asyncHandler from "express-async-handler";
import PlaybackState from "../Models/PlaybackStateModel.js";
import WatchHistory from "../Models/WatchModel.js";
import Movies from "../Models/MoviesModel.js";

const FINISH_THRESHOLD = 0.9;   // >=90% coi như hoàn tất
const MIN_PING_SECONDS = 0;     // bỏ qua ping quá nhỏ

const clampProgress = (position, duration) => {
    const d = Math.max(1, duration || 1);
    const p = Math.max(0, Math.min(1, (position || 0) / d));
    return Math.round(p * 100);
};

// @desc   Ghi nhận tiến độ xem (start/progress/complete) & upsert trạng thái
// @route  POST /api/watch
// @access Private
export const upsertWatch = asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
        res.status(401);
        throw new Error("Unauthorized");
    }

    const {
        movieId,
        seasonNumber = null,
        episodeNumber = null,
        position = 0,
        duration = 0,
        event = "progress",        // "start" | "progress" | "complete"
        sessionId = null,
        playedSeconds = 0,         // nếu tính ở client, mỗi ping ~10s
    } = req.body;

    if (!movieId) {
        res.status(400);
        throw new Error("movieId is required");
    }

    // 1) Ghi log (append). Bỏ qua progress quá nhỏ để chống spam.
    if (event !== "progress" || playedSeconds >= MIN_PING_SECONDS) {
        await WatchHistory.create({
            userId, movieId, seasonNumber, episodeNumber,
            action: event, position, duration, playedSeconds,
            client: {
                deviceId: req.headers["x-device-id"] || null,
                ua: req.headers["user-agent"] || null,
                ip: req.ip || null,
            },
            ts: new Date(),
        });
    }

    // 2) Tính trạng thái hợp nhất
    const progressPct = clampProgress(position, duration);
    const finished = progressPct >= Math.round(FINISH_THRESHOLD * 100) || event === "complete";

    const key = { userId, movieId, seasonNumber, episodeNumber };
    const exist = await PlaybackState.findOne(key).lean();

    // 3) Denormalize thông tin phim lần đầu
    let denorm = {};
    if (!exist) {
        const m = await Movies.findById(movieId).lean();
        if (m) {
            denorm = {
                title: m.name || m.title || null,
                posterPath: m.titleImage || m.posterPath || m.poster_path || null,
                backdropPath: m.image || m.backdropPath || m.backdrop_path || null,
                isPremium: !!m.isPremium,
                releaseDate: m.year ? String(m.year) : (m.releaseDate || m.release_date || null),
            };
        }
    }

    const update = {
        $set: {
            lastPosition: Math.floor(position),
            duration: Math.floor(duration),
            progressPct,
            finished,
            lastActionAt: new Date(),
            lastAction: event,
            lastSessionId: sessionId || null,
            ...denorm,
        },
        $setOnInsert: { createdAt: new Date() },
    };

    const state = await PlaybackState.findOneAndUpdate(key, update, { upsert: true, new: true });
    res.json({ ok: true, data: state });
});

// @desc   Danh sách “Tiếp tục xem” (chưa hoàn tất)
// @route  GET /api/watch/me/continue
// @access Private
export const getContinueWatching = asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
        res.status(401);
        throw new Error("Unauthorized");
    }

    const rows = await PlaybackState.find({ userId, finished: { $ne: true } })
        .sort({ lastActionAt: -1 })
        .limit(30)
        .lean();

    res.json({ ok: true, data: rows });
});

// @desc   “Đã xem gần đây” (mọi trạng thái, sort theo thời gian)
// @route  GET /api/watch/me/recent
// @access Private
export const getRecentlyWatched = asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
        res.status(401);
        throw new Error("Unauthorized");
    }

    const rows = await PlaybackState.find({ userId })
        .sort({ lastActionAt: -1 })
        .limit(50)
        .lean();

    res.json({ ok: true, data: rows });
});

// @desc   Lấy trạng thái phát 1 phim/episode để resume
// @route  GET /api/watch/me/state?movieId=...&seasonNumber=...&episodeNumber=...
// @access Private
export const getPlaybackState = asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
        res.status(401);
        throw new Error("Unauthorized");
    }

    const { movieId, seasonNumber = null, episodeNumber = null } = req.query;
    if (!movieId) {
        res.status(400);
        throw new Error("movieId is required");
    }

    const state = await PlaybackState.findOne({ userId, movieId, seasonNumber, episodeNumber }).lean();
    res.json({ ok: true, data: state || null });
});

// @desc   Xoá 1 mục lịch sử xem theo movieId
// @route  DELETE /api/watch/me/:movieId
// @access Private
export const deleteOnePlayback = asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
        res.status(401);
        throw new Error("Unauthorized");
    }

    const { movieId } = req.params;
    await PlaybackState.deleteMany({ userId, movieId });
    res.json({ ok: true });
});

// @desc   Xoá toàn bộ lịch sử xem của tôi
// @route  DELETE /api/watch/me
// @access Private
export const clearAllPlayback = asyncHandler(async (req, res) => {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
        res.status(401);
        throw new Error("Unauthorized");
    }

    await PlaybackState.deleteMany({ userId });
    res.json({ ok: true });
});

/* =========================
   (Tuỳ chọn) ADMIN ANALYTICS
   ========================= */

// @desc   Top phim theo thời gian xem 7 ngày gần nhất
// @route  GET /api/watch/admin/top
// @access Private/Admin
export const adminTopWatched = asyncHandler(async (req, res) => {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const rows = await WatchHistory.aggregate([
        { $match: { ts: { $gte: since }, action: "progress" } },
        { $group: { _id: "$movieId", seconds: { $sum: "$playedSeconds" }, users: { $addToSet: "$userId" } } },
        { $project: { seconds: 1, viewers: { $size: "$users" } } },
        { $sort: { seconds: -1 } },
        { $limit: 10 },
    ]);
    res.json({ ok: true, data: rows });
});
