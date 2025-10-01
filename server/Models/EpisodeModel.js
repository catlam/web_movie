import mongoose from "mongoose";

const EpisodeSchema = new mongoose.Schema(
    {
        seriesId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Series",
            required: true,
            index: true,
        },
        seasonId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Season",
            required: true,
            index: true,
        },
        episodeNumber: { type: Number, required: true }, // 1..N
        title: { type: String, required: true, trim: true },
        desc: { type: String, default: "" },
        video: { type: String, required: true },     // URL mp4/hls
        duration: { type: Number, default: 0 },      // giây
        releaseDate: { type: Date },
    },
    { timestamps: true }
);

EpisodeSchema.index({ seasonId: 1, episodeNumber: 1 }, { unique: true });

export default mongoose.model("Episode", EpisodeSchema);
