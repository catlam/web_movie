import mongoose from "mongoose";

const playbackStateSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        movieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Movies",
            required: true,
            index: true,
        },

        // Cho TV/series (nếu có)
        seasonNumber: { type: Number, default: null, index: true },
        episodeNumber: { type: Number, default: null, index: true },

        // Trạng thái phát
        lastPosition: { type: Number, default: 0 }, // giây
        duration: { type: Number, default: 0 },     // giây
        progressPct: { type: Number, default: 0 },  // 0..100
        finished: { type: Boolean, default: false },

        lastAction: {
            type: String,
            enum: ["start", "progress", "complete"],
            default: "progress",
        },
        lastActionAt: { type: Date, default: Date.now, index: true },
        lastSessionId: { type: String, default: null },

        // Denormalize để render “Tiếp tục xem” nhanh (lấy từ Movies khi tạo lần đầu)
        title: { type: String, default: null },
        posterPath: { type: String, default: null },
        backdropPath: { type: String, default: null },
        isPremium: { type: Boolean, default: false },
        releaseDate: { type: String, default: null },
    },
    {
        timestamps: true,
        versionKey: false,
        collection: "playback_state",
    }
);

// Lấy “Tiếp tục xem” nhanh
playbackStateSchema.index({ userId: 1, finished: 1, lastActionAt: -1 });

export default mongoose.model("PlaybackState", playbackStateSchema);
