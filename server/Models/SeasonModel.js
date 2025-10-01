import mongoose from "mongoose";

const SeasonSchema = new mongoose.Schema(
    {
        seriesId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Series",
            required: true,
            index: true,
        },
        seasonNumber: { type: Number, required: true }, // 1, 2, 3...
        name: { type: String, default: "" },            
        desc: { type: String, default: "" },
    },
    { timestamps: true }
);

SeasonSchema.index({ seriesId: 1, seasonNumber: 1 }, { unique: true });

export default mongoose.model("Season", SeasonSchema);
