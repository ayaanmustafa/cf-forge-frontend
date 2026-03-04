import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNotification } from './Notification';
import { fetchTags, createTag, deleteTag } from '../api/tags';
import Modal from './Modal';

const TagManager = ({ isOpen, onClose, onTagDeleted }) => {
  const { user } = useUser();
  const { showNotification } = useNotification();
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [loading, setLoading] = useState(false);

  const loadTags = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const tagList = await fetchTags(user.handle);
      setTags(tagList);
    } catch (error) {
      showNotification('Failed to load tags', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      loadTags();
    }
  }, [isOpen, user]);

  const handleCreateTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim()) {
      showNotification('Tag name cannot be empty', 'error');
      return;
    }

    try {
      await createTag(user.handle, newTagName, newTagColor);
      showNotification('Tag created!', 'success');
      setNewTagName('');
      setNewTagColor('#3b82f6');
      await loadTags();
    } catch (error) {
      if (error.response?.status === 400) {
        showNotification('Tag already exists', 'error');
      } else {
        showNotification('Failed to create tag', 'error');
      }
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm('Delete this tag?')) return;
    try {
      await deleteTag(tagId);
      showNotification('Tag deleted', 'success');
      await loadTags();
      onTagDeleted?.();
    } catch (error) {
      showNotification('Failed to delete tag', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} title="Manage Tags" onClose={onClose}>
      <div className="space-y-6">
        {/* Create New Tag Form */}
        <form onSubmit={handleCreateTag} className="space-y-4 border-b pb-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Tag Name</label>
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="e.g., DP, Greedy, Hard"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black placeholder-gray-500"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-white">Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-10 h-10 cursor-pointer border border-gray-300 rounded"
                />
                <span className="text-sm text-gray-300 self-center">{newTagColor}</span>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition"
          >
            Create Tag
          </button>
        </form>

        {/* Tags List */}
        <div>
          <h3 className="font-semibold mb-3">Your Tags ({tags.length})</h3>
          {tags.length === 0 ? (
            <p className="text-gray-500 text-sm">No tags yet</p>
          ) : (
            <div className="space-y-2">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="font-medium">{tag.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TagManager;
