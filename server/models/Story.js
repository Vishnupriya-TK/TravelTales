import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: String,
    text: String
}, { timestamps: true });

const storySchema = new mongoose.Schema({
    title: String,
    description: String,
    location: String,
    image: String,
    tags: [String],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema]
}, { timestamps: true });

export default mongoose.model("Story", storySchema);
