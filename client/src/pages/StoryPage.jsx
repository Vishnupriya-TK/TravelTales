import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchStory, toggleLike, addComment, deleteComment, removeLikeByOwner, updateStory, deleteStory, getUserIdFromToken } from "../api";
import { useToast } from "../context/ToastContext";

const StoryPage = () => {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState("");
  const navigate = useNavigate();
  const { addToast } = useToast();

  const refresh = async () => {
    try {
      const res = await fetchStory(id);
      setStory(res.data);
    } catch {
      addToast('Failed to load story', 'error');
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchStory(id);
        setTimeout(() => setStory(res.data), 0);
      } catch {
        addToast('Failed to load story', 'error');
      }
    })();
  }, [id, addToast]);

  if (!story) return <div className="p-6">Loading...</div>;

  const currentUserId = getUserIdFromToken();
  const isOwner = story.user && ((story.user._id ? story.user._id : story.user)?.toString() === currentUserId);
  const authorName = story.user && (story.user.name || story.user);
  const authorEmail = story.user && (story.user.email || null);

  const handleLike = async () => {
    if (!currentUserId) return navigate('/login');
    try {
      await toggleLike(story._id);
      addToast('Like updated', 'success');
      await refresh();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to like';
      addToast(msg, 'error');
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return addToast('Comment empty', 'error');
    if (!currentUserId) return navigate('/login');
    try {
      await addComment(story._id, comment);
      setComment("");
      addToast('Comment posted', 'success');
      await refresh();
    } catch { addToast('Failed to post comment', 'error'); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(story._id, commentId);
      addToast('Comment removed', 'success');
      await refresh();
    } catch { addToast('Failed to remove comment', 'error'); }
  };

  const handleRemoveLikeByOwner = async (userId) => {
    try {
      await removeLikeByOwner(story._id, userId);
      addToast('Like removed', 'success');
      await refresh();
    } catch { addToast('Failed to remove like', 'error'); }
  };

  const handleSaveEdit = async () => {
    const tagsArr = Array.isArray(story.tags) ? story.tags : (typeof story.tags === 'string' ? story.tags.split(',').map(t => t.trim()).filter(Boolean) : []);
    try {
      const res = await updateStory(story._id, { title: story.title, description: story.description, location: story.location, image: story.image, tags: tagsArr });
      // update local story immediately from server response (populated)
      setStory(res.data);
      addToast('Story updated', 'success');
      setEditing(false);
    } catch (err) { addToast('Failed to update', 'error'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete story?')) return;
    try {
      await deleteStory(story._id);
      addToast('Story deleted', 'success');
      navigate('/');
    } catch { addToast('Failed to delete', 'error'); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded">
      {/* Responsive header: image with flexible content, stacks on narrow screens */}
      <div className="flex flex-col md:flex-row items-start gap-4">
        <img src={story.image} className="w-full md:w-48 h-48 object-cover rounded" />
        <div className="flex-1">
          {editing ? (
            <div className="space-y-2">
              <input className="w-full p-2 border rounded" value={story.title} onChange={e => setStory({ ...story, title: e.target.value })} />
              <input className="w-full p-2 border rounded" value={story.location} onChange={e => setStory({ ...story, location: e.target.value })} />
              <input className="w-full p-2 border rounded" value={Array.isArray(story.tags) ? story.tags.join(',') : (story.tags||'')} onChange={e => setStory({ ...story, tags: e.target.value })} />
              <textarea className="w-full p-2 border rounded" rows={6} value={story.description||''} onChange={e => setStory({ ...story, description: e.target.value })} />
              <div className="flex gap-2">
                <button onClick={handleSaveEdit} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded">Save</button>
                <button onClick={() => setEditing(false)} className="px-4 py-2 border rounded">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold">{story.title}</h2>
              <p className="text-sm text-gray-500">{story.location} • by <strong className="text-gray-700">{authorName}</strong>{authorEmail ? <span className="text-xs text-gray-400"> ({authorEmail})</span> : null}</p>
              <div className="mt-3 flex gap-2 items-center">
                {!isOwner && <button onClick={handleLike} className="px-3 py-1 bg-pink-100 text-pink-600 rounded hover:bg-pink-200">❤️ {story.likes?.length || 0}</button>}
                <button onClick={async () => {
                  const url = window.location.href;
                  try {
                    await navigator.clipboard.writeText(url);
                    addToast('Link copied to clipboard', 'success');
                  } catch (e) {
                    addToast('Could not copy link', 'error');
                    if (navigator.share) navigator.share({ title: story.title, url }).catch(()=>{});
                  }
                }} className="px-3 py-1 border rounded">Share</button>
                {isOwner && (
                  <>
                    <button onClick={() => setEditing(true)} className="px-3 py-1 border rounded">Edit</button>
                    <button onClick={handleDelete} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
                  </>
                )}
              </div>
              <div className="mt-3">
                <h4 className="font-semibold">Tags</h4>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {(story.tags||[]).map((t, i) => <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">{t}</span>)}
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold">Story</h4>
                <p className="mt-2 text-gray-700 whitespace-pre-wrap">{story.description}</p>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold">Likes</h4>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {(story.likes||[]).map((l, idx) => (
                    <div key={idx} className="bg-gray-100 px-2 py-1 rounded flex items-center gap-2">
                      <span className="text-xs">{l?.name ? `${l.name}${l.email ? ' ('+l.email+')' : ''}` : (l?.user ? `${l.user.name} (${l.user.email || 'no-email'})` : 'User')}</span>
                      {isOwner && <button onClick={() => handleRemoveLikeByOwner(l._id || l)} className="text-red-500 text-xs">x</button>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-semibold">Comments</h4>
        <div className="space-y-2 mt-2">
          {(story.comments||[]).map(c => {
            const commenterName = c.name || (c.user && c.user.name) || (typeof c.user === 'string' ? c.user : 'Unknown');
            const isCommentOwner = (c.user && c.user._id ? c.user._id : c.user)?.toString() === (typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user')||'null')?.id);
            const isStoryOwner = isOwner;
            return (
              <div key={c._id} className="text-sm border p-2 rounded flex justify-between items-start">
                <div><strong className="text-xs text-gray-500">{commenterName}:</strong> {c.text}</div>
                {(isCommentOwner || isStoryOwner) && (
                  <button onClick={() => handleDeleteComment(c._id)} className="text-red-600 hover:underline">Delete</button>
                )}
              </div>
            );
          })}
        </div>

        {!isOwner && (
          <div className="mt-3 flex gap-2">
            <input value={comment} onChange={e => setComment(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Write a comment..." />
            <button onClick={handleComment} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded">Post</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryPage;