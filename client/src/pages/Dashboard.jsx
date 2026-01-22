import { useEffect, useState, useMemo } from "react";
import {
  fetchStories,
  deleteStory,
  deleteComment,
  removeLikeByOwner,
  getUserIdFromToken
} from "../api";

import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import StoryCard from "../components/StoryCard";

const Dashboard = () => {
  const [stories, setStories] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [q, setQ] = useState("");
  const [tagFilter, setTagFilter] = useState([]);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const userId = getUserIdFromToken();

  const onKeySearch = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const allTags = useMemo(() => {
    const s = new Set();
    stories.forEach(st => (st.tags || []).forEach(t => s.add(t)));
    return Array.from(s);
  }, [stories]);

  // const load = async () => {
  //   try {
  //     const res = await fetchStories({ user: userId });
  //     setStories(res.data);
  //   } catch {
  //     addToast("Failed to load your posts", "error");
  //   }
  // };
  const load = async (params = {}) => {
    try {
      const res = await fetchStories({ user: userId, ...params });
      setStories(res.data);
    } catch {
      addToast("Failed to load posts", "error");
    }
  };


  useEffect(() => {
    if (!userId) return navigate("/login");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleSearch = async () => {
    try {
      const params = { user: userId };
      if (q) params.q = q;
      if (tagFilter.length > 0) params.tags = tagFilter.join(",");
      const res = await fetchStories(params);
      setStories(res.data);
    } catch {
      addToast("Search failed", "error");
    }
  };

  const handleReset = async () => {
    setQ("");
    setTagFilter([]);
    load();
  };

  const handleTagFilter = async (t) => {
    const next = tagFilter.includes(t)
      ? tagFilter.filter(tag => tag !== t)
      : [...tagFilter, t];
    setTagFilter(next);

    try {
      const params = { user: userId };
      if (next.length > 0) params.tags = next.join(",");
      if (q) params.q = q;
      const res = await fetchStories(params);
      setStories(res.data);
    } catch {
      addToast("Tag filter failed", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this story?")) return;
    try {
      await deleteStory(id);
      addToast("Deleted", "success");
      load();
    } catch {
      addToast("Delete failed", "error");
    }
  };

  const handleDeleteComment = async (storyId, commentId) => {
    try {
      await deleteComment(storyId, commentId);
      addToast("Comment removed", "success");
      load();
    } catch {
      addToast("Failed to remove comment", "error");
    }
  };

  const handleRemoveLike = async (storyId, userId) => {
    try {
      await removeLikeByOwner(storyId, userId);
      addToast("Like removed", "success");
      load();
    } catch {
      addToast("Failed to remove like", "error");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-center lg:text-left">
          My Dashboard
        </h1>

        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={onKeySearch}
            placeholder="Search your posts..."
            className="w-full sm:w-56 px-3 py-2 border rounded"
          />

          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
          >
            Search
          </button>

          <button
            onClick={handleReset}
            className="px-4 py-2 border rounded "
          >
            Reset
          </button>

          <Link
            to="/create"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded text-center"
          >
            New Story
          </Link>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-4 flex gap-2 flex-wrap justify-center lg:justify-start">
        {allTags.map(t => (
          <button
            key={t}
            onClick={() => handleTagFilter(t)}
            className={`px-3 py-1 rounded ${tagFilter.includes(t)
                ? "bg-sky-600 text-white"
                : "bg-white shadow"
              }`}

          >
            {t}
          </button>
        ))}
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map(story => (
          <div key={story._id} className="relative">
            <StoryCard
              story={story}
              onView={() => navigate(`/story/${story._id}`)}
              onLike={() => { }}
              onDelete={handleDelete}
              onEdit={() => navigate(`/story/${story._id}?edit=true`)}
              currentUserId={userId}
            />

            {/* Action buttons */}
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() =>
                  setExpanded(expanded === story._id ? null : story._id)
                }
                className="px-3 py-2 border rounded"
              >
                Manage
              </button>

              <button
                onClick={() => navigate(`/story/${story._id}`)}
                className="px-3 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
              >
                Open
              </button>
            </div>

            {/* Expanded Panel */}
            {expanded === story._id && (
              <div className="mt-3 p-3 border rounded bg-white max-h-96 overflow-y-auto">
                <h4 className="font-semibold">Comments</h4>

                <div className="space-y-2 mt-2">
                  {(story.comments || []).map(c => (
                    <div
                      key={c._id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                    >
                      <div className="text-sm">
                        <strong className="text-xs text-gray-500">
                          {c.name}:
                        </strong>{" "}
                        {c.text}
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteComment(story._id, c._id)
                        }
                        className="text-red-600 text-xs hover:underline self-end"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>

                <h4 className="font-semibold mt-4">Likes</h4>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {(story.likes || []).map(l => (
                    <div
                      key={l._id || l}
                      className="bg-gray-100 px-2 py-1 rounded flex items-center gap-2"
                    >
                      <span className="text-xs">
                        {l?.name || l?.email || "User"}
                      </span>
                      <button
                        onClick={() =>
                          handleRemoveLike(story._id, l._id || l)
                        }
                        className="text-red-500 text-xs"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
