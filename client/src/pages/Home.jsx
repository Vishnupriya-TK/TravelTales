import { useEffect, useState, useMemo } from "react";
import { fetchStories, toggleLike, deleteStory, getUserIdFromToken } from "../api";
import { useNavigate } from "react-router-dom";
import StoryCard from "../components/StoryCard";
import { useToast } from "../context/ToastContext";

const Home = () => {
  const [stories, setStories] = useState([]);
  const [q, setQ] = useState("");
  const [tagFilter, setTagFilter] = useState([]);
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
    await deleteStory(id);
    addToast("Deleted", "success");
    search();
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
            currentUserId={getUserIdFromToken()}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
