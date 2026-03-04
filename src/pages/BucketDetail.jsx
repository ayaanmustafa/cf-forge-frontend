import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { viewBucket, removeProblemFromBucket, fetchBuckets } from '../api/buckets'
import { removeTagFromProblem } from '../api/tags'
import ProblemCard from '../components/ProblemCard'
import Modal from '../components/Modal'
import TagSelector from '../components/TagSelector'
import NoteModal from '../components/NoteModal'
import Notification, { useNotification } from '../components/Notification'

const BucketDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useUser()
  const { notification, showNotification } = useNotification()
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [bucketName, setBucketName] = useState('')
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [modalType, setModalType] = useState(null)

  useEffect(() => {
    loadBucketDetails()
  }, [id])

  const loadBucketDetails = async () => {
    setLoading(true)
    try {
      // Fetch bucket name from buckets list
      const buckets = await fetchBuckets(user.handle)
      const bucket = buckets.find(b => b.id === parseInt(id))
      if (bucket) {
        setBucketName(bucket.name)
      }

      // Fetch problems in bucket
      const data = await viewBucket(id)
      setProblems(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading bucket:', err)
      showNotification('✗ Failed to load bucket', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = (problemId) => {
    const problem = problems.find(p => p.id === problemId)
    setSelectedProblem(problem)
    setModalType('tagSelector')
  }

  const handleAddNote = (problemId) => {
    const problem = problems.find(p => p.id === problemId)
    setSelectedProblem(problem)
    setModalType('note')
  }

  const handleRemoveTag = async (problemId, tagId) => {
    if (!window.confirm('Remove this tag?')) return
    try {
      await removeTagFromProblem(problemId, tagId)
      showNotification('✓ Tag removed', 'success')
      await loadBucketDetails()
    } catch (error) {
      showNotification('Failed to remove tag', 'error')
    }
  }

  const handleViewNote = (problemId) => {
    const problem = problems.find(p => p.id === problemId)
    setSelectedProblem(problem)
    setModalType('viewNote')
  }

  const handleRemoveProblem = async (problemId) => {
    if (window.confirm('Remove this problem from the bucket?')) {
      try {
        await removeProblemFromBucket(id, problemId)
        showNotification('✓ Problem removed from bucket', 'success')
        await loadBucketDetails()
      } catch (err) {
        showNotification('✗ Failed to remove problem', 'error')
        console.error('Error removing problem:', err)
      }
    }
  }

  const closeModal = () => {
    setModalType(null)
    setSelectedProblem(null)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-zinc-100">{bucketName || 'Bucket'}</h1>
        <button 
          onClick={() => navigate('/buckets')}
          className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
        >
          ← Back
        </button>
      </div>

      {loading ? (
        <div className="text-center text-zinc-400">Loading...</div>
      ) : problems.length === 0 ? (
        <div className="text-center text-zinc-400 py-12">
          No problems in this bucket yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problems.map(sp => {
            const problemData = {
              id: sp.id,
              ...sp.problem,
              user_note: sp.user_note,
              tags: sp.tags || [],
              buckets: sp.buckets || []
            }
            return (
              <div key={sp.id} className="relative">
                <ProblemCard
                  problem={problemData}
                  onAddTag={handleAddTag}
                  onAddBucket={() => {}}
                  onAddNote={handleAddNote}
                  onRemoveTag={handleRemoveTag}
                  onViewNote={handleViewNote}
                />
                <button
                  onClick={() => handleRemoveProblem(sp.id)}
                  className="absolute top-2 right-2 px-2 py-1 rounded text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition"
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Tag Selector Modal */}
      <TagSelector
        isOpen={modalType === 'tagSelector'}
        onClose={closeModal}
        solvedId={selectedProblem?.id}
        onTagAdded={loadBucketDetails}
      />

      {/* Note Modal */}
      <NoteModal
        isOpen={modalType === 'note'}
        onClose={closeModal}
        solvedId={selectedProblem?.id}
        initialNote={selectedProblem?.user_note || ''}
      />

      {/* View Note Modal */}
      <Modal
        isOpen={modalType === 'viewNote'}
        title={`Note for ${selectedProblem?.problem?.name || 'Problem'}`}
        onClose={closeModal}
      >
        <div className="space-y-4">
          <div className="p-4 bg-white text-black rounded-lg min-h-[200px] max-h-[400px] overflow-y-auto whitespace-pre-wrap font-mono text-sm border border-gray-300">
            {selectedProblem?.user_note}
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={closeModal}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(selectedProblem?.user_note || '')
                showNotification('Note copied to clipboard!', 'success')
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition"
            >
              📋 Copy
            </button>
            <button
              onClick={() => {
                setModalType('note')
              }}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition"
            >
              ✏️ Edit
            </button>
          </div>
        </div>
      </Modal>

      <Notification notification={notification} />
    </div>
  )
}

export default BucketDetail
