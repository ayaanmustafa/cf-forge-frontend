import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNotification } from './Notification';
import { fetchTags, addTagToProblem } from '../api/tags';
import Modal from './Modal';

const TagSelector = ({ isOpen, onClose, solvedId, onTagAdded }) => {
  const { user } = useUser();
  const { showNotification } = useNotification();
  const [tags, setTags] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
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

  const handleSelectTag = async (tagId) => {
    try {
      await addTagToProblem(solvedId, tagId);
      showNotification('Tag added!', 'success');
      setExistingTags([...existingTags, tagId]);
      if (onTagAdded) {
        onTagAdded();
      }
    } catch (error) {
      if (error.response?.status === 400) {
        showNotification('Tag already added to this problem', 'error');
      } else {
        showNotification('Failed to add tag', 'error');
      }
    }
  };

  const availableTags = tags.filter(tag => !existingTags.includes(tag.id));

  return (
    <Modal isOpen={isOpen} title="Add Tag" onClose={onClose}>
      <div className="space-y-3">
        {availableTags.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No available tags. Create one first!</p>
        ) : (
          availableTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleSelectTag(tag.id)}
              className="w-full flex items-center gap-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 transition"
            >
              <div
                className="w-4 h-4 rounded flex-shrink-0"
                style={{ backgroundColor: tag.color }}
              />
              <span className="font-medium flex-1">{tag.name}</span>
              <span className="text-blue-500 font-semibold">+</span>
            </button>
          ))
        )}
      </div>
    </Modal>
  );
};

export default TagSelector;
