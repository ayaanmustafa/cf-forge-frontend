import { useState } from 'react';
import { useNotification } from './Notification';
import { saveNote } from '../api/notes';
import Modal from './Modal';

const NoteModal = ({ isOpen, onClose, solvedId, initialNote = '' }) => {
  const [note, setNote] = useState(initialNote);
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleSave = async () => {
    try {
      setLoading(true);
      await saveNote(solvedId, note);
      showNotification('Note saved!', 'success');
      onClose();
    } catch (error) {
      showNotification('Failed to save note', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} title="Add/Edit Note" onClose={onClose}>
      <div className="space-y-4">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write your note here..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] font-mono text-sm resize-none bg-white text-black placeholder-gray-500"
        />
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
          >
            {loading ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NoteModal;
