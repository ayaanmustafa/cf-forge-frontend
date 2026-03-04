import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { fetchBuckets, createBucket, renameBucket, deleteBucket } from '../api/buckets'
import BucketCard from '../components/BucketCard'
import Modal from '../components/Modal'
import Notification, { useNotification } from '../components/Notification'

const Buckets = () => {
  const { user } = useUser()
  const navigate = useNavigate()
  const { notification, showNotification } = useNotification()
  const [buckets, setBuckets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newBucket, setNewBucket] = useState({ name: '', color: '#3b82f6' })
  const [error, setError] = useState(null)
  const [renameModalOpen, setRenameModalOpen] = useState(false)
  const [renamingBucketId, setRenamingBucketId] = useState(null)
  const [renamingValue, setRenamingValue] = useState('')

  useEffect(() => {
    if (user?.handle) {
      loadBuckets()
    }
  }, [user?.handle])

  const loadBuckets = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchBuckets(user.handle)
      setBuckets(Array.isArray(data) ? data : [])
    } catch (err) {
      setError('Failed to load buckets')
      console.error('Error loading buckets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBucket = async () => {
    if (!newBucket.name.trim()) {
      setError('Please enter a bucket name')
      return
    }

    try {
      await createBucket(user.handle, newBucket.name)
      const bucketName = newBucket.name
      setNewBucket({ name: '', color: '#3b82f6' })
      setShowCreateModal(false)
      showNotification(`✓ Bucket "${bucketName}" created`, 'success')
      loadBuckets()
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message
      if (errMsg.includes('UNIQUE')) {
        setError('A bucket with this name already exists')
      } else {
        setError('Failed to create bucket')
      }
      console.error('Error creating bucket:', err)
    }
  }

  const handleOpenBucket = (id) => {
    navigate(`/bucket/${id}`)
  }

  const handleRenameBucket = (id, currentName) => {
    setRenamingBucketId(id)
    setRenamingValue(currentName)
    setRenameModalOpen(true)
  }

  const handleSaveRename = async () => {
    if (!renamingValue.trim()) {
      setError('Please enter a bucket name')
      return
    }

    try {
      await renameBucket(renamingBucketId, renamingValue)
      showNotification('✓ Bucket renamed', 'success')
      setRenameModalOpen(false)
      loadBuckets()
    } catch (err) {
      setError('Failed to rename bucket')
      console.error('Error renaming bucket:', err)
    }
  }

  const handleDeleteBucket = async (id, name) => {
    if (window.confirm(`Delete bucket "${name}"? This cannot be undone.`)) {
      try {
        await deleteBucket(id)
        showNotification(`✓ Bucket "${name}" deleted`, 'success')
        loadBuckets()
      } catch (err) {
        setError('Failed to delete bucket')
        console.error('Error deleting bucket:', err)
      }
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-zinc-100">Buckets</h1>
        <button
          onClick={() => {
            setShowCreateModal(true)
            setError(null)
          }}
          className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition"
        >
          + New Bucket
        </button>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center text-zinc-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {buckets.map(bucket => (
            <BucketCard
              key={bucket.id}
              bucket={bucket}
              onOpen={handleOpenBucket}
              onRename={handleRenameBucket}
              onDelete={handleDeleteBucket}
            />
          ))}
        </div>
      )}

      {buckets.length === 0 && !loading && (
        <div className="text-center text-zinc-400 py-12">
          No buckets yet. Create one to organize your problems.
        </div>
      )}

      {/* Create Bucket Modal */}
      <Modal
        isOpen={showCreateModal}
        title="Create New Bucket"
        onClose={() => {
          setShowCreateModal(false)
          setError(null)
        }}
      >
        <input
          type="text"
          placeholder="Bucket name"
          value={newBucket.name}
          onChange={(e) => {
            setNewBucket({...newBucket, name: e.target.value})
            setError(null)
          }}
          className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-zinc-100 mb-3 focus:outline-none"
        />
        {error && <p className="text-rose-400 text-sm mb-3">{error}</p>}
        <button
          onClick={handleCreateBucket}
          className="w-full px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition"
        >
          Create
        </button>
      </Modal>

      {/* Rename Bucket Modal */}
      <Modal
        isOpen={renameModalOpen}
        title="Rename Bucket"
        onClose={() => setRenameModalOpen(false)}
      >
        <input
          type="text"
          placeholder="New name"
          value={renamingValue}
          onChange={(e) => setRenamingValue(e.target.value)}
          className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-zinc-100 mb-4 focus:outline-none"
          autoFocus
        />
        <button
          onClick={handleSaveRename}
          className="w-full px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition"
        >
          Save
        </button>
      </Modal>

      <Notification notification={notification} />
    </div>
  )
}

export default Buckets
