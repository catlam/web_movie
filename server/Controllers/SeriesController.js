import asyncHandler from "express-async-handler";
import Series from "../Models/SeriesModel.js";
import Season from "../Models/SeasonModel.js";
import Episode from "../Models/EpisodeModel.js";

// GET /api/series
export const listSeries = asyncHandler(async (req, res) => {
    const { search = "", pageNumber = 1, limit = 12, sort = "newest" } = req.query;
    const page = Math.max(1, Number(pageNumber));
    const size = Math.max(1, Number(limit));

    const filter = search
        ? { $or: [{ name: { $regex: search, $options: "i" } }, { desc: { $regex: search, $options: "i" } }] }
        : {};

    let sortSpec = { createdAt: -1 };
    if (sort === "oldest") sortSpec = { createdAt: 1 };
    if (sort === "az") sortSpec = { name: 1 };
    if (sort === "za") sortSpec = { name: -1 };
    if (sort === "rate_desc") sortSpec = { rate: -1 };
    if (sort === "rate_asc") sortSpec = { rate: 1 };

    const [items, count] = await Promise.all([
        Series.find(filter).sort(sortSpec).skip((page - 1) * size).limit(size),
        Series.countDocuments(filter),
    ]);

    res.json({ items, page, pages: Math.ceil(count / size), total: count });
});

// GET /api/series/:id
export const getSeries = async (req, res) => {
    try {
        const series = await Series.findById(req.params.id)
            .populate({
                path: "seasons",
                populate: { path: "episodes" } // populate cả episodes bên trong mỗi season
            })
            .populate("episodes"); // nếu có field episodes riêng ở cấp series

        if (!series) {
            return res.status(404).json({ message: "Series not found" });
        }

        res.json(series);
    } catch (error) {
        console.error("[getSeriesById] error:", error);
        res.status(500).json({ message: error.message });
    }
};


// POST /api/series  (admin)
export const createSeries = asyncHandler(async (req, res) => {
    const payload = req.body || {};
    const s = await Series.create({ ...payload, createdBy: req.user?._id });
    res.status(201).json(s);
});

// PUT /api/series/:id  (admin)
export const updateSeries = asyncHandler(async (req, res) => {
    const s = await Series.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!s) return res.status(404).json({ message: "Series not found" });
    res.json(s);
});

// DELETE /api/series/:id  (admin)
// Xoá series → xoá luôn seasons + episodes liên quan
export const deleteSeries = asyncHandler(async (req, res) => {
    const id = req.params.id;
    const s = await Series.findById(id);
    if (!s) return res.status(404).json({ message: "Series not found" });

    const seasons = await Season.find({ seriesId: id }).select("_id");
    const seasonIds = seasons.map((x) => x._id);

    await Episode.deleteMany({ seriesId: id });
    await Season.deleteMany({ seriesId: id });
    await s.deleteOne();

    res.json({ message: "Series deleted", deletedSeasons: seasonIds.length });
});

// GET /api/series/:id/summary  (tuỳ chọn)
// trả tổng số season & episode
export const seriesSummary = asyncHandler(async (req, res) => {
    const seriesId = req.params.id;
    const [seasonCount, episodeCount] = await Promise.all([
        Season.countDocuments({ seriesId }),
        Episode.countDocuments({ seriesId }),
    ]);
    res.json({ seriesId, seasonCount, episodeCount });
});


// @desc    Create series review
// @route   POST /api/series/:id/reviews
// @access  Private
export const createSeriesReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    const series = await Series.findById(req.params.id);
    if (!series) {
        res.status(404);
        throw new Error("Series not found");
    }

    // 1 user chỉ được review 1 lần
    const alreadyReviewed = series.reviews.find(
        (r) => r.userId.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
        res.status(400);
        throw new Error("You already reviewed this series");
    }

    const review = {
        userName: req.user.fullName,
        userId: req.user._id,
        userImage: req.user.image,
        rating: Number(rating),
        comment,
    };

    series.reviews.push(review);
    series.numberOfReviews = series.reviews.length;
    series.rate =
        series.reviews.reduce((acc, item) => acc + (item.rating || 0), 0) /
        series.reviews.length;

    await series.save();

    res.status(201).json({ message: "Review added" });
});

// @desc    Delete my review on series
// @route   DELETE /api/series/:id/reviews
// @access  Private
export const deleteSeriesReview = asyncHandler(async (req, res) => {
    const series = await Series.findById(req.params.id);
    if (!series) {
        res.status(404);
        throw new Error("Series not found");
    }

    const myIndex = series.reviews.findIndex(
        (r) => r.userId.toString() === req.user._id.toString()
    );
    if (myIndex === -1) {
        res.status(404);
        throw new Error("You haven't reviewed this series");
    }

    series.reviews.splice(myIndex, 1);
    series.numberOfReviews = series.reviews.length;
    series.rate =
        series.reviews.length === 0
            ? 0
            : series.reviews.reduce((acc, item) => acc + (item.rating || 0), 0) /
            series.reviews.length;

    await series.save();

    res.json({ message: "Review deleted successfully" });
});
