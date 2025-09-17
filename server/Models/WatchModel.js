import mongoose from "mongoose";

const watchHistorySchema = new mongoose.Schema(
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

        // Dùng cho TV/series (có thể để null nếu chỉ phim lẻ)
        seasonNumber: { type: Number, default: null, index: true },
        episodeNumber: { type: Number, default: null, index: true },

        // Sự kiện xem
        action: {
            type: String,
            enum: ["start", "progress", "complete"],
            required: true,
        },
        position: { type: Number, default: 0 },   // giây hiện tại
        duration: { type: Number, default: 0 },   // tổng thời lượng (giây)
        playedSeconds: { type: Number, default: 0 }, // phần tăng thêm (tùy tính ở client)

        // Thông tin client (tùy chọn)
        client: {
            deviceId: { type: String, default: null },
            ua: { type: String, default: null },
            ip: { type: String, default: null },
        },

        ts: { type: Date, default: Date.now, index: true },
    },
    {
        timestamps: false, // đã có field ts ở trên
        versionKey: false,
        collection: "watch_history",
    }
);

// Truy vấn nhanh theo user + movie + thời gian
watchHistorySchema.index({ userId: 1, movieId: 1, ts: -1 });

export default mongoose.model("WatchHistory", watchHistorySchema);
