import express from "express";
import Story from "../models/Story.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = express.Router();

/* ================= CREATE STORY (IMAGE URL) ================= */
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, location, tags, image } = req.body;

    const tagsArr = Array.isArray(tags)
      ? tags
      : typeof tags === "string"
      ? tags.split(",").map(t => t.trim()).filter(Boolean)
      : [];

    const story = await Story.create({
      title,
      description,
      location,
      image, // ✅ image URL directly stored
      tags: tagsArr,
      user: req.userId,
    });

    const populated = await Story.findById(story._id)
      .populate("user", "name email")
      .populate("likes", "name email")
      .populate("comments.user", "name");

    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create story" });
  }
});

/* ================= GET ALL STORIES ================= */
router.get("/", async (req, res) => {
  try {
    const { q, tags, user } = req.query;
    const filter = {};

    if (q) {
      const re = new RegExp(q, "i");
      filter.$or = [
        { title: re },
        { description: re },
        { location: re },
      ];
    }

    if (tags) {
      filter.tags = { $in: tags.split(",") };
    }

    if (user) {
      filter.user = user;
    }

    const stories = await Story.find(filter)
      .populate("user", "name email")
      .populate("likes", "name email")
      .populate("comments.user", "name")
      .sort({ createdAt: -1 });

    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stories" });
  }
});

/* ================= GET SINGLE STORY ================= */
router.get("/:id", async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate("user", "name email")
      .populate("likes", "name email")
      .populate("comments.user", "name");

    if (!story)
      return res.status(404).json({ message: "Story not found" });

    res.json(story);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch story" });
  }
});

/* ================= UPDATE STORY ================= */
router.put("/:id", auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story)
      return res.status(404).json({ message: "Story not found" });

    if (story.user.toString() !== req.userId)
      return res.status(403).json({ message: "Not authorized" });

    const { title, description, location, image, tags } = req.body;

    if (title) story.title = title;
    if (description) story.description = description;
    if (location) story.location = location;
    if (image) story.image = image;

    if (tags) {
      story.tags = Array.isArray(tags)
        ? tags
        : tags.split(",").map(t => t.trim()).filter(Boolean);
    }

    await story.save();

    const populated = await Story.findById(story._id)
      .populate("user", "name email")
      .populate("likes", "name email")
      .populate("comments.user", "name");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update story" });
  }
});

/* ================= DELETE STORY ================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story)
      return res.status(404).json({ message: "Story not found" });

    if (story.user.toString() !== req.userId)
      return res.status(403).json({ message: "Not authorized" });

    await story.deleteOne();
    res.json({ message: "Story deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete story" });
  }
});

/* ================= LIKE STORY ================= */
router.put("/like/:id", auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story)
      return res.status(404).json({ message: "Story not found" });

    const index = story.likes.findIndex(id => id.toString() === req.userId);
    index === -1 ? story.likes.push(req.userId) : story.likes.splice(index, 1);

    await story.save();

    const populated = await Story.findById(req.params.id)
      .populate("likes", "name email");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to like story" });
  }
});

/* ================= REMOVE LIKE BY OWNER ================= */
router.put("/:storyId/remove-like/:userId", auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);

    if (!story)
      return res.status(404).json({ message: "Story not found" });

    // Only story owner can remove likes
    if (story.user.toString() !== req.userId)
      return res.status(403).json({ message: "Not authorized" });

    const userIdToRemove = req.params.userId;
    const index = story.likes.findIndex(id => id.toString() === userIdToRemove);

    if (index === -1)
      return res.status(404).json({ message: "Like not found" });

    story.likes.splice(index, 1);
    await story.save();

    const populated = await Story.findById(req.params.storyId)
      .populate("likes", "name email");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to remove like" });
  }
});

/* ================= COMMENT ================= */
router.post("/comment/:id", auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story)
      return res.status(404).json({ message: "Story not found" });

    const user = await User.findById(req.userId);

    story.comments.push({
      user: req.userId,
      name: user.name,
      text: req.body.text,
    });

    await story.save();

    const populated = await Story.findById(req.params.id)
      .populate("comments.user", "name");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to add comment" });
  }
});

/* ================= DELETE COMMENT ================= */
router.delete("/comment/:storyId/:commentId", auth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);
    if (!story)
      return res.status(404).json({ message: "Story not found" });

    const comment = story.comments.id(req.params.commentId);
    if (!comment)
      return res.status(404).json({ message: "Comment not found" });

    if (comment.user.toString() !== req.userId && story.user.toString() !== req.userId)
      return res.status(403).json({ message: "Not authorized" });

    story.comments.pull(req.params.commentId);
    await story.save();

    res.json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete comment" });
  }
});

export default router;
