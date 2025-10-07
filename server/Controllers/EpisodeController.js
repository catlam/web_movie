import asyncHandler from "express-async-handler";
import Season from "../Models/SeasonModel.js";
import Episode from "../Models/EpisodeModel.js";
import Series from "../Models/SeriesModel.js";

// GET /api/seasons/:seasonId/episodes
export const listEpisodesOfSeason = asyncHandler(async (req, res) => {
    const { seasonId } = req.params;
    const episodes = await Episode.find({ seasonId }).sort({ episodeNumber: 1 });
    res.json(episodes);
});

// POST /api/seasons/:seasonId/episodes  (admin)
export const createEpisode = asyncHandler(async (req, res) => {
    const { seasonId } = req.params;
    const { episodeNumber, title, desc, video, duration, releaseDate } = req.body;

    const season = await Season.findById(seasonId);
    if (!season) return res.status(404).json({ message: "Season not found" });

    const ep = await Episode.create({
        seriesId: season.seriesId,
        seasonId,
        episodeNumber,
        title,
        desc,
        video,
        duration,
        releaseDate,
    });

    // await Season.findByIdAndUpdate(seasonId, { $addToSet: { episodes: ep._id } });
    // await Series.findByIdAndUpdate(season.seriesId, { $addToSet: { episodes: ep._id } });
    await Promise.all([
        Season.findByIdAndUpdate(seasonId, { $addToSet: { episodes: ep._id } }),
        Series.findByIdAndUpdate(season.seriesId, { $addToSet: { episodes: ep._id } }),
    ]);

    res.status(201).json(ep);
});

// GET /api/episodes/:id
export const getEpisode = asyncHandler(async (req, res) => {
    const ep = await Episode.findById(req.params.id);
    if (!ep) return res.status(404).json({ message: "Episode not found" });
    res.json(ep);
});

// PUT /api/episodes/:id  (admin)
export const updateEpisode = asyncHandler(async (req, res) => {
    const ep = await Episode.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ep) return res.status(404).json({ message: "Episode not found" });
    res.json(ep);
});

// DELETE /api/episodes/:id  (admin)
export const deleteEpisode = asyncHandler(async (req, res) => {
    const ep = await Episode.findById(req.params.id);
    if (!ep) return res.status(404).json({ message: "Episode not found" });
    await ep.deleteOne();
    res.json({ message: "Episode deleted" });
});
