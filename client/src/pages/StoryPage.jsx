import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { fetchStory, toggleLike, addComment, deleteComment, removeLikeByOwner, updateStory, deleteStory, getUserIdFromToken } from "../api";
import { useToast } from "../context/ToastContext";

const StoryPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [story, setStory] = useState(null);
  const [editing, setEditing] = useState(searchParams.get('edit') === 'true');
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
      const res = await deleteComment(story._id, commentId);
      // If response includes updated story, use it; otherwise refresh
      if (res.data && res.data._id) {
        setStory(res.data);
      } else {
        await refresh();
      }
      addToast('Comment removed', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to remove comment', 'error');
    }
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
    <div className="p-6 max-w-4xl mx-auto bg-white shadow rounded">
      {/* Story Image - Full Width */}
      <div className="mb-6">
        <img src={story.image} alt={story.title} className="w-full h-64 md:h-96 object-cover rounded-lg shadow-md" />
      </div>
      
      {/* Story Content */}
      <div className="space-y-4">
        {editing ? (
          <div className="space-y-3">
            <input className="w-full p-3 border rounded" placeholder="Title" value={story.title} onChange={e => setStory({ ...story, title: e.target.value })} />
            <input className="w-full p-3 border rounded" placeholder="Location" value={story.location} onChange={e => setStory({ ...story, location: e.target.value })} />
            <input className="w-full p-3 border rounded" placeholder="Tags (comma separated)" value={Array.isArray(story.tags) ? story.tags.join(',') : (story.tags||'')} onChange={e => setStory({ ...story, tags: e.target.value })} />
            <textarea className="w-full p-3 border rounded" rows={8} placeholder="Story description" value={story.description||''} onChange={e => setStory({ ...story, description: e.target.value })} />
            <div className="flex gap-2">
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded">Save</button>
              <button onClick={() => setEditing(false)} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            {/* Title and Author Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{story.title}</h1>
              <p className="text-gray-600">
                <span className="font-medium">{story.location}</span>
                {authorName && (
                  <span className="text-gray-500"> • by <strong className="text-gray-700">{authorName}</strong>{authorEmail ? <span className="text-sm text-gray-400"> ({authorEmail})</span> : null}</span>
                )}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 items-center">
              {!isOwner && (
                <button onClick={handleLike} className="px-4 py-2 bg-pink-100 text-pink-600 rounded hover:bg-pink-200 transition">
                  ❤️ Like {story.likes?.length > 0 && `(${story.likes.length})`}
                </button>
              )}
              <button onClick={async () => {
                const url = window.location.href;
                try {
                  await navigator.clipboard.writeText(url);
                  addToast('Link copied to clipboard', 'success');
                } catch (e) {
                  addToast('Could not copy link', 'error');
                  if (navigator.share) navigator.share({ title: story.title, url }).catch(()=>{});
                }
              }} className="px-4 py-2 border rounded hover:bg-gray-50 transition">
                Share
              </button>
              {isOwner && (
                <>
                  <button onClick={() => setEditing(true)} className="px-4 py-2 border rounded hover:bg-gray-50 transition">Edit</button>
                  <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">Delete</button>
                </>
              )}
            </div>

            {/* Description Section - Full Content */}
            {story.description && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Story</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">{story.description}</p>
              </div>
            )}

            {/* Tags */}
            {story.tags && story.tags.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Tags</h4>
                <div className="flex gap-2 flex-wrap">
                  {(story.tags||[]).map((t, i) => (
                    <span key={i} className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-sm font-medium">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Likes */}
            {story.likes && story.likes.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Liked by ({story.likes.length})</h4>
                <div className="flex gap-2 flex-wrap">
                  {(story.likes||[]).map((l, idx) => (
                    <div key={idx} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                      <span className="text-sm">{l?.name ? `${l.name}${l.email ? ' ('+l.email+')' : ''}` : (l?.user ? `${l.user.name} (${l.user.email || 'no-email'})` : 'User')}</span>
                      {isOwner && <button onClick={() => handleRemoveLikeByOwner(l._id || l)} className="text-red-500 text-xs hover:text-red-700">×</button>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Comments Section */}
      <div className="mt-8 pt-6 border-t">
        <h3 className="text-xl font-semibold mb-4">Comments</h3>
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