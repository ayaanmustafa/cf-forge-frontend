import { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { fetchSolvedProblems, syncProblems } from '../api/problems'
import { fetchBuckets, addProblemToBucket } from '../api/buckets'
import { removeTagFromProblem, fetchTags } from '../api/tags'
import ProblemCard from '../components/ProblemCard'
import Modal from '../components/Modal'
import TagManager from '../components/TagManager'
import TagSelector from '../components/TagSelector'
import NoteModal from '../components/NoteModal'
import Notification, { useNotification } from '../components/Notification'

const Solved = () => {
  const { user } = useUser()
  const { notification, showNotification } = useNotification()
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [buckets, setBuckets] = useState([])
  
  const [ratingMin, setRatingMin] = useState(1200)
  const [ratingMax, setRatingMax] = useState(2000)
  const [selectedBucket, setSelectedBucket] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [allTags, setAllTags] = useState([])
  
  const [selectedProblemId, setSelectedProblemId] = useState(null)
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [modalType, setModalType] = useState(null)
  const [selectedBucketId, setSelectedBucketId] = useState('')
  const [showTagManager, setShowTagManager] = useState(false)

  useEffect(() => {
    if (user?.handle) {
      loadTags()
      loadBuckets()
      loadProblems()
    }
  }, [user?.handle, ratingMin, ratingMax, selectedBucket, selectedTag])

  const loadTags = async () => {
    try {
      const data = await fetchTags(user.handle)
      setAllTags(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading tags:', err)
    }
  }

  const loadBuckets = async () => {
    try {
      const data = await fetchBuckets(user.handle)
      setBuckets(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading buckets:', err)
    }
  }

  const loadProblems = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSolvedProblems(user.handle, {
        ratingMin,
        ratingMax,
      })
      let filtered = Array.isArray(data) ? data : []
      
      // Filter by tag if selected
      if (selectedTag) {
        filtered = filtered.filter(sp => 
          sp.tags && sp.tags.some(t => t.tag.id === parseInt(selectedTag))
        )
      }
      
      setProblems(filtered)
    } catch (err) {
      setError('Failed to load problems. Make sure your data is synced.')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    setError(null)
    try {
      const result = await syncProblems(user.handle)
      await loadTags()
      await loadProblems()
      showNotification(`✓ Synced ${result.count} problems from Codeforces`, 'success')
    } catch (err) {
      setError(`Sync failed: ${err.response?.data?.detail || err.message}`)
    } finally {
      setSyncing(false)
    }
  }

  const handleAddTag = (problemId) => {
    const problem = problems.find(p => p.id === problemId)
    setSelectedProblem(problem)
    setModalType('tagSelector')
  }

  const handleAddBucket = (problemId) => {
    setSelectedProblemId(problemId)
    setSelectedBucketId('')
    setModalType('bucket')
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
      await loadProblems()
    } catch (error) {
      showNotification('Failed to remove tag', 'error')
    }
  }

  const handleViewNote = (problemId) => {
    const problem = problems.find(p => p.id === problemId)
    setSelectedProblem(problem)
    setModalType('viewNote')
  }

  const handleExportProblems = (format) => {
    if (problems.length === 0) {
      showNotification('No problems to export', 'error')
      return
    }

    let content, filename, type

    if (format === 'csv') {
      const headers = ['Contest', 'Index', 'Name', 'Rating', 'Tags', 'Note']
      const rows = problems.map(sp => {
        const tags = sp.tags?.map(t => t.tag.name).join('; ') || ''
        return [
          sp.problem.contest_id,
          sp.problem.index,
          `"${sp.problem.name}"`,
          sp.problem.rating || '',
          `"${tags}"`,
          `"${(sp.user_note || '').replace(/"/g, '""')}"`
        ]
      })
      content = [headers, ...rows].map(row => row.join(',')).join('\n')
      filename = `problems-${new Date().toISOString().split('T')[0]}.csv`
      type = 'text/csv'
    } else if (format === 'json') {
      const data = problems.map(sp => ({
        contest_id: sp.problem.contest_id,
        index: sp.problem.index,
        name: sp.problem.name,
        rating: sp.problem.rating,
        tags: sp.tags?.map(t => ({ id: t.tag.id, name: t.tag.name })) || [],
        note: sp.user_note || ''
      }))
      content = JSON.stringify(data, null, 2)
      filename = `problems-${new Date().toISOString().split('T')[0]}.json`
      type = 'application/json'
    }

    if (content) {
      const blob = new Blob([content], { type })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
      showNotification(`✓ Exported ${problems.length} problems as ${format.toUpperCase()}`, 'success')
    }
  }

  const closeModal = () => {
    setModalType(null)
    setSelectedProblemId(null)
    setSelectedProblem(null)
    setSelectedBucketId('')
  }

  const handleAddToBucket = async () => {
    if (!selectedBucketId) {
      setError('Please select a bucket')
      return
    }

    try {
      await addProblemToBucket(selectedBucketId, selectedProblemId)
      showNotification('✓ Added to bucket', 'success')
      closeModal()
    } catch (err) {
      const msg = err.response?.data?.detail || err.message
      if (msg.includes('already in bucket')) {
        showNotification('✗ Problem already in this bucket', 'error')
      } else {
        showNotification(`✗ ${msg}`, 'error')
      }
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-zinc-100">Solved Problems</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTagManager(true)}
            className="px-4 py-2 rounded bg-purple-500 hover:bg-purple-600 text-white transition text-sm"
          >
            Tags
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 text-white transition text-sm"
          >
            {syncing ? '⟳ Syncing...' : '⟳ Sync'}
          </button>
          <div className="flex gap-1 border-l border-zinc-600 pl-2">
            <button
              onClick={() => handleExportProblems('csv')}
              className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition text-sm"
              title="Export as CSV"
            >
              📥 CSV
            </button>
            <button
              onClick={() => handleExportProblems('json')}
              className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition text-sm"
              title="Export as JSON"
            >
              📥 JSON
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-2">Rating Min</label>
            <input
              type="range"
              min="800"
              max="3500"
              value={ratingMin}
              onChange={(e) => setRatingMin(parseInt(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-zinc-500">{ratingMin}</span>
          </div>

          <div>
            <label className="text-sm text-zinc-400 block mb-2">Rating Max</label>
            <input
              type="range"
              min="800"
              max="3500"
              value={ratingMax}
              onChange={(e) => setRatingMax(parseInt(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-zinc-500">{ratingMax}</span>
          </div>

          <div>
            <label className="text-sm text-zinc-400 block mb-2">Filter by Bucket</label>
            <select
              value={selectedBucket}
              onChange={(e) => setSelectedBucket(e.target.value)}
              className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Buckets</option>
              {buckets.map(bucket => (
                <option key={bucket.id} value={bucket.id}>
                  {bucket.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-zinc-400 block mb-2">Filter by Tag</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Problems Grid */}
      {loading ? (
        <div className="text-center text-zinc-400">Loading problems...</div>
      ) : problems.length === 0 ? (
        <div className="text-center text-zinc-400 py-12">
          No problems yet. Click "Sync" to load your solved problems from Codeforces.
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
              <ProblemCard
                key={sp.id}
                problem={problemData}
                onAddTag={handleAddTag}
                onAddBucket={handleAddBucket}
                onAddNote={handleAddNote}
                onRemoveTag={handleRemoveTag}
                onViewNote={handleViewNote}
              />
            )
          })}
        </div>
      )}

      {/* Tag Manager Modal */}
      <TagManager isOpen={showTagManager} onClose={() => setShowTagManager(false)} onTagDeleted={loadProblems} />

      {/* Tag Selector Modal */}
      <TagSelector
        isOpen={modalType === 'tagSelector'}
        onClose={closeModal}
        solvedId={selectedProblem?.id}
        onTagAdded={loadProblems}
      />

      {/* Note Modal */}
      <NoteModal
        isOpen={modalType === 'note'}
        onClose={closeModal}
        solvedId={selectedProblem?.id}
        initialNote={selectedProblem?.user_note || ''}
      />

      {/* Add to Bucket Modal */}
      <Modal
        isOpen={modalType === 'bucket'}
        title="Add to Bucket"
        onClose={closeModal}
      >
        <select
          value={selectedBucketId}
          onChange={(e) => setSelectedBucketId(e.target.value)}
          className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-zinc-100 mb-4 focus:outline-none"
        >
          <option value="">Select a bucket...</option>
          {buckets.map(bucket => (
            <option key={bucket.id} value={bucket.id}>
              {bucket.name}
            </option>
          ))}
        </select>
        <button
          onClick={handleAddToBucket}
          className="w-full px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition"
        >
          Add to Bucket
        </button>
      </Modal>

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

export default Solved
