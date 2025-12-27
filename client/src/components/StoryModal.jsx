import  { useState } from "react";
import { addComment, updateStory, getUserIdFromToken, deleteComment, removeLikeByOwner } from "../api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

const StoryModal = ({ story: initial, onClose, onUpdated }) => {
  const [editing, setEditing] = useState(false);
  const [story, setStory] = useState(initial);
  const [comment, setComment] = useState("");

  const currentUserId = getUserIdFromToken();
  const isStoryOwner = (story.user && (story.user._id ? story.user._id : story.user))?.toString() === currentUserId;

  const navigate = useNavigate();

  const { addToast } = useToast();

  const submitComment = async () => {
    if (!comment.trim()) return addToast('Comment is empty', 'error');
    const user = getUserIdFromToken();
    if (!user) return navigate("/login");
    try {
      const res = await addComment(story._id, comment);
      setComment("");
      setStory(res.data);
      addToast('Comment posted', 'success');
      onUpdated && onUpdated();
    } catch {
      addToast('Failed to post comment', 'error');
    }
  };

  const saveEdit = async () => {
    try {
      const { title, description, location, image, tags } = story;
      const tagsArr = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);
      const res = await updateStory(story._id, { title, description, location, image, tags: tagsArr });
      // update local state from server response (populated)
      setStory(res.data);
      setEditing(false);
      addToast('Story updated', 'success');
      onUpdated && onUpdated();
    } catch (e) {
      addToast('Failed to update story', 'error');
    }
  };

  const handleDeleteComment = async (storyId, commentId) => {
    try {
      const res = await deleteComment(storyId, commentId);
      setStory(res.data);
      addToast('Comment removed', 'success');
      onUpdated && onUpdated();
    } catch {
      addToast('Failed to remove comment', 'error');
    }
  };

  const handleRemoveLikeByOwner = async (userId) => {
    try {
      const res = await removeLikeByOwner(story._id, userId);
      setStory(res.data);
      addToast('Like removed', 'success');
      onUpdated && onUpdated();
    } catch { addToast('Failed to remove like', 'error'); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold">{editing ? "Edit Story" : story.title}</h2>
          <div className="flex gap-2">
            {editing ? (
              <button onClick={() => setEditing(false)} className="px-3 py-1 border rounded">Cancel</button>
            ) : (
              // Only show Edit button to story owner
              isStoryOwner ? <button onClick={() => setEditing(true)} className="px-3 py-1 border rounded">Edit</button> : null
            )}
           
            <button onClick={async () => {
              const url = `${window.location.origin}/story/${story._id}`;
              try {
                await navigator.clipboard.writeText(url);
                addToast('Link copied to clipboard', 'success');
              } catch (e) {
                addToast('Could not copy link', 'error');
                // fallback: open system share if available
                if (navigator.share) navigator.share({ title: story.title, url }).catch(()=>{});
              }
            }} className="px-3 py-1 border rounded">Share</button>
            <button onClick={onClose} className="px-3 py-1 border rounded">Close</button>
          </div>
        </div>

        {/* Responsive layout: single column on small screens, image and meta stacked on left on md+ */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            {/* Image scales for responsive breakpoints */}
            <img src={story.image} className="w-full h-40 sm:h-48 md:h-56 object-cover rounded" />
            <p className="mt-2 text-sm text-gray-600">{story.location}</p>
            <div className="mt-3">
              <h4 className="font-semibold">Tags</h4>
              <div className="flex gap-2 mt-2 flex-wrap">
                {(story.tags || []).map((t, idx) => (
                  <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-xs">{t}</span>
                ))}
              </div>
            </div>
            <div className="mt-3">
              <h4 className="font-semibold">Likes</h4>
              <div className="flex gap-2 mt-2 flex-wrap">
                {(story.likes || []).map((l, idx) => {
                  const display = l?.name ? `${l.name}${l.email ? ' ('+l.email+')' : ''}` : (l?.user?.name ? `${l.user.name} (${l.user.email || 'no-email'})` : (typeof l === 'string' ? l : (l?._id ? l._id : 'User')));
                  return (
                    <div key={idx} className="bg-gray-100 px-2 py-1 rounded flex items-center gap-2">
                      <span className="text-xs">{display}</span>
                      {isStoryOwner && <button onClick={() => handleRemoveLikeByOwner(l._id || l)} className="text-red-500 text-xs">x</button>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            {editing ? (
              <div className="space-y-2">
                <input className="w-full p-2 border rounded" value={story.title} onChange={e => setStory({...story, title: e.target.value})} />
                <input className="w-full p-2 border rounded" value={story.location} onChange={e => setStory({...story, location: e.target.value})} />
                <input className="w-full p-2 border rounded" value={story.image} onChange={e => setStory({...story, image: e.target.value})} />
                <input className="w-full p-2 border rounded" value={Array.isArray(story.tags) ? story.tags.join(',') : (story.tags || '')} onChange={e => setStory({...story, tags: e.target.value})} placeholder="Tags (comma separated)" />
                <textarea className="w-full p-2 border rounded" rows={6} value={story.description || ""} onChange={e => setStory({...story, description: e.target.value})} />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded transition">Save</button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-700">{story.description}</p>
                <div className="mt-4">
                  <h4 className="font-semibold">Comments</h4>
                  <div className="space-y-2 mt-2">
                    {(story.comments || []).map((c, idx) => {
                      const commenterName = c.name || (c.user && c.user.name) || (typeof c.user === 'string' ? c.user : 'Unknown');
                      const isCommentOwner = (c.user && c.user._id ? c.user._id : c.user)?.toString() === (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user') || 'null')?.id);
                      const isStoryOwner = (story.user && (story.user._id ? story.user._id : story.user))?.toString() === (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user') || 'null')?.id);
                      return (
                        <div key={idx} className="text-sm border p-2 rounded flex justify-between items-start">
                          <div><strong className="text-xs text-gray-500">{commenterName}:</strong> {c.text}</div>
                          {(isCommentOwner || isStoryOwner) && (
                            <button onClick={() => handleDeleteComment(story._id, c._id)} className="text-red-600 hover:underline">Delete</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {!isStoryOwner && (
                    <div className="mt-3 flex gap-2">
                      <input value={comment} onChange={e => setComment(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Write a comment..." />
                      <button onClick={submitComment} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition">Post</button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryModal;