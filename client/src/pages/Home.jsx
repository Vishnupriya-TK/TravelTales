import { useEffect, useState, useMemo } from "react";
import { fetchStories, toggleLike, deleteStory, getUserIdFromToken, fetchStory } from "../api";
import { useNavigate } from "react-router-dom";
import StoryCard from "../components/StoryCard";
import StoryModal from "../components/StoryModal";
import { useToast } from "../context/ToastContext";

const Home = () => {
  const [stories, setStories] = useState([]);
  const [q, setQ] = useState("");
  const [tagFilter, setTagFilter] = useState([]);
  const [editingStory, setEditingStory] = useState(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const load = async (params = {}) => {
    try {
      const res = await fetchStories(params);
      setStories(res.data);
    } catch {
      addToast("Failed to load stories", "error");
    }
  };

  useEffect(() => { load(); }, []);

  const search = () => {
    load({
      q: q || undefined,
      tags: tagFilter.length ? tagFilter.join(",") : undefined
    });
  };

  const allTags = useMemo(() => {
    const s = new Set();
    stories.forEach(st => (st.tags || []).forEach(t => s.add(t)));
    return [...s];
  }, [stories]);

  const handleLike = async (id) => {
    const uid = getUserIdFromToken();
    if (!uid) return navigate("/login");
    await toggleLike(id);
    search();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete story?")) return;
    try {
      await deleteStory(id);
      addToast("Deleted", "success");
      setEditingStory(null);
      search();
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to delete story", "error");
    }
  };

  const handleEdit = async (story) => {
    try {
      // Fetch the full story data with all populated fields
      const res = await fetchStory(story._id);
      setEditingStory(res.data);
    } catch (err) {
      addToast(err.response?.data?.message || "Failed to load story", "error");
    }
  };

  const handleStoryUpdated = () => {
    search(); // Refresh the stories list
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Latest Stories</h1>

      <div className="flex gap-2 mb-4">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search..."
          className="flex-1 p-2 border rounded flex flex-col sm:flex-row sm:flex-wrap gap-2 w-full lg:w-auto"
        />
        <button onClick={search} className="bg-sky-600 text-white px-4 rounded">
          Search
        </button>
        <button onClick={() => { setQ(""); setTagFilter([]); load(); }} className="bg-gray-300 px-4 rounded">
          Reset
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        {allTags.map(t => (
          <button
            key={t}
            onClick={() => {
              const next = tagFilter.includes(t)
                ? tagFilter.filter(x => x !== t)
                : [...tagFilter, t];
              setTagFilter(next);
              load({ tags: next.join(",") });
            }}
            className={`px-3 py-1 rounded ${
              tagFilter.includes(t)
                ? "bg-sky-600 text-white"
                : "bg-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map(story => (
          <StoryCard
            key={story._id}
            story={story}
            onView={() => navigate(`/story/${story._id}`)}
            onLike={handleLike}
            onDelete={handleDelete}
            onEdit={() => handleEdit(story)}
            currentUserId={getUserIdFromToken()}
          />
        ))}
      </div>

      {/* Edit Modal */}
      {editingStory && (
        <StoryModal
          story={editingStory}
          onClose={() => setEditingStory(null)}
          onUpdated={handleStoryUpdated}
        />
      )}
    </div>
  );
};

export default Home;
