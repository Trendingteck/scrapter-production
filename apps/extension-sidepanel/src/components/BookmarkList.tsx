/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from 'react';
import { FaTrash, FaPen, FaCheck, FaTimes } from 'react-icons/fa';
import { t } from '@extension/i18n';

interface Bookmark {
  id: number;
  title: string;
  content: string;
}

interface BookmarkListProps {
  bookmarks: Bookmark[];
  onBookmarkSelect: (content: string) => void;
  onBookmarkUpdateTitle?: (id: number, title: string) => void;
  onBookmarkDelete?: (id: number) => void;
  onBookmarkReorder?: (draggedId: number, targetId: number) => void;
  isDarkMode?: boolean;
}

const BookmarkList: React.FC<BookmarkListProps> = ({
  bookmarks,
  onBookmarkSelect,
  onBookmarkUpdateTitle,
  onBookmarkDelete,
  onBookmarkReorder,
  isDarkMode = false,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEditClick = (bookmark: Bookmark) => {
    setEditingId(bookmark.id);
    setEditTitle(bookmark.title);
  };

  const handleSaveEdit = (id: number) => {
    if (onBookmarkUpdateTitle && editTitle.trim()) {
      onBookmarkUpdateTitle(id, editTitle);
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id.toString());
    e.currentTarget.classList.add('opacity-30');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-30');
    setDraggedId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (draggedId === null || draggedId === targetId) return;

    if (onBookmarkReorder) {
      onBookmarkReorder(draggedId, targetId);
    }
  };

  // Focus the input field when entering edit mode
  useEffect(() => {
    if (editingId !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  return (
    <div className="p-4">
      <h3 className={`mb-4 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
        {t('chat_bookmarks_header')}
      </h3>
      <div className="flex flex-col gap-2">
        {bookmarks.map(bookmark => (
          <div
            key={bookmark.id}
            draggable={editingId !== bookmark.id}
            onDragStart={e => handleDragStart(e, bookmark.id)}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDrop={e => handleDrop(e, bookmark.id)}
            className={`group relative rounded-xl p-3.5 transition-all duration-200 border ${isDarkMode
                ? 'bg-zinc-900/50 border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-900'
                : 'bg-white border-zinc-100 hover:border-orange-500/50 hover:shadow-md hover:shadow-orange-500/5'
              }`}>
            {editingId === bookmark.id ? (
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className={`grow rounded-lg px-2 py-1 text-sm font-medium ${isDarkMode ? 'border-zinc-700 bg-zinc-800 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-900'
                    } border focus:border-orange-500 outline-none`}
                />
                <button
                  onClick={() => handleSaveEdit(bookmark.id)}
                  className="rounded-lg p-2 text-orange-500 hover:bg-orange-500/10 transition-colors"
                  aria-label={t('chat_bookmarks_saveEdit')}
                  type="button">
                  <FaCheck size={14} />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="rounded-lg p-2 text-red-500 hover:bg-red-500/10 transition-colors"
                  aria-label={t('chat_bookmarks_cancelEdit')}
                  type="button">
                  <FaTimes size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onBookmarkSelect(bookmark.content)}
                  className="flex-1 text-left">
                  <div
                    className={`truncate text-sm font-bold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>
                    {bookmark.title}
                  </div>
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditClick(bookmark)}
                    className={`rounded-lg p-1.5 transition-colors ${isDarkMode ? 'text-zinc-500 hover:bg-zinc-800 hover:text-orange-500' : 'text-zinc-400 hover:bg-zinc-50 hover:text-orange-600'
                      }`}
                    aria-label={t('chat_bookmarks_edit')}
                    type="button">
                    <FaPen size={12} />
                  </button>
                  <button
                    onClick={() => onBookmarkDelete && onBookmarkDelete(bookmark.id)}
                    className={`rounded-lg p-1.5 transition-colors ${isDarkMode ? 'text-zinc-500 hover:bg-zinc-800 hover:text-red-500' : 'text-zinc-400 hover:bg-zinc-50 hover:text-red-600'
                      }`}
                    aria-label={t('chat_bookmarks_delete')}
                    type="button">
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {bookmarks.length === 0 && (
          <div className={`text-center py-8 rounded-xl border border-dashed ${isDarkMode ? 'border-zinc-800 text-zinc-600' : 'border-zinc-200 text-zinc-400'}`}>
            <p className="text-xs font-medium">No bookmarks yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkList;
