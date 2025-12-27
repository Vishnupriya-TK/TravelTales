import { useState, useEffect } from "react";
import { createStory, getUserIdFromToken } from "../api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

const CreateStory = () => {
  const [data, setData] = useState({
    title: "",
    description: "",
    location: "",
    image: "",
    tags: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const id = getUserIdFromToken();
    if (!id) navigate("/login");
  }, [navigate]);

  const submit = async () => {
    if (!data.title.trim())
      return addToast("Title is required", "error");

    if (!data.image.trim())
      return addToast("Image URL is required", "error");

    setLoading(true);
    try {
      await createStory({
        title: data.title,
        description: data.description,
        location: data.location,
        image: data.image, // ✅ URL sent
        tags: data.tags,
      });

      addToast("Story added successfully", "success");
      navigate("/");
    } catch (err) {
      addToast(
        err.response?.data?.message || "Failed to create story",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Create a New Story</h2>

      <div className="space-y-3">
        <input
          className="w-full p-3 border rounded"
          placeholder="Title"
          value={data.title}
          onChange={e => setData({ ...data, title: e.target.value })}
        />

        <input
          className="w-full p-3 border rounded"
          placeholder="Location"
          value={data.location}
          onChange={e => setData({ ...data, location: e.target.value })}
        />

        <input
          className="w-full p-3 border rounded"
          placeholder="Image URL (https://...)"
          value={data.image}
          onChange={e => setData({ ...data, image: e.target.value })}
        />

        <input
          className="w-full p-3 border rounded"
          placeholder="Tags (comma separated)"
          value={data.tags}
          onChange={e => setData({ ...data, tags: e.target.value })}
        />

        <textarea
          className="w-full p-3 border rounded"
          rows={6}
          placeholder="Tell your story..."
          value={data.description}
          onChange={e => setData({ ...data, description: e.target.value })}
        />

        {/* Image preview */}
        {data.image && (
          <img
            src={data.image}
            alt="Preview"
            className="w-full h-64 object-cover rounded border"
            onError={e => (e.target.style.display = "none")}
          />
        )}

        <div className="flex gap-2">
          <button
            onClick={submit}
            disabled={loading}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded transition"
          >
            {loading ? "Posting..." : "Post Story"}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 border rounded hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStory;
