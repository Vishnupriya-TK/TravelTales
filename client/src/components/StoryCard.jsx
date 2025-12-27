import React from "react";
import { useToast } from "../context/ToastContext";

const StoryCard = ({ story, onView, onLike, onDelete, onEdit, currentUserId }) => {
  const isOwner = story.user && (story.user._id ? story.user._id === currentUserId : story.user === currentUserId);
  const { addToast } = useToast();
  const authorName = story.user && (story.user.name || story.user);
  const authorEmail = story.user && (story.user.email || null);

  return (
    // Card is responsive: stacked layout on small screens, consistent padding and hover states
    <div className="bg-white shadow-lg rounded overflow-hidden hover:shadow-2xl transition">
      <div className="h-36 sm:h-48 md:h-56 bg-gray-200">
        {/* Image scales with container for responsive layout */}
        <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{story.title}</h3>
            <p className="text-sm text-gray-500">{story.location}</p>
            {/* Show author name and email if available */}
            {story.user && (
              <div className="mt-1 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-semibold">{authorName ? authorName[0] : 'U'}</div>
                <div className="text-xs text-gray-400">
                  By <strong className="text-gray-700">{authorName}</strong>{authorEmail ? <span className="text-xs text-gray-500"> ({authorEmail})</span> : null}
                </div>
              </div>
            )}
            {/* Tags */}
            <div className="mt-2 flex gap-2 flex-wrap">
              {(story.tags || []).map((t, i) => <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">{t}</span>)}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isOwner && (
              <button onClick={() => onLike(story._id)} className="text-pink-600 hover:opacity-80 transition">❤️ {story.likes?.length || 0}</button>
            )}
            <button onClick={() => onView(story)} className="px-3 py-1 bg-sky-600 text-white rounded hover:bg-sky-700 transition">View</button>
            {/* Share uses navigator.clipboard or navigator.share fallback */}
            <button onClick={async () => {
              try {
                const url = `${window.location.origin}/story/${story._id}`;
                await navigator.clipboard.writeText(url);
                addToast('Link copied to clipboard', 'success');
              } catch {
                addToast('Could not copy link', 'error');
                if (navigator.share) navigator.share({ title: story.title, url: `${window.location.origin}/story/${story._id}` }).catch(()=>{});
              }
            }} className="px-2 py-1 border rounded text-sm">Share</button>
          </div>
          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <button onClick={() => onEdit(story)} className="px-3 py-1 border rounded hover:bg-gray-50 transition">Edit</button>
                <button onClick={() => onDelete(story._id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition">Delete</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;