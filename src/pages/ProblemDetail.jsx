import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getProblemById, updateProblem } from '../api/problems'

const ProblemDetail = () => {
  const { id } = useParams()
  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [isEditingNotes, setIsEditingNotes] = useState(false)

  useEffect(() => {
    loadProblem()
  }, [id])

  const loadProblem = async () => {
    setLoading(true)
    try {
      const data = await getProblemById(id)
      setProblem(data)
      setNotes(data.notes || '')
    } catch (err) {
      console.error('Error loading problem:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotes = async () => {
    try {
      await updateProblem(id, { notes })
      setIsEditingNotes(false)
      loadProblem()
    } catch (err) {
      console.error('Error saving notes:', err)
    }
  }

  if (loading) return <div className="p-6 text-zinc-400">Loading...</div>
  if (!problem) return <div className="p-6 text-rose-400">Problem not found</div>

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Problem Info */}
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <h1 className="text-2xl font-bold text-zinc-100 mb-4">{problem.name}</h1>
            
            <div className="mb-4">
              <p className="text-sm text-zinc-400 mb-1">Rating</p>
              <p className="text-3xl font-bold text-blue-400">{problem.rating}</p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-zinc-400 mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {problem.tags?.map(tag => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: tag.color + '22',
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-zinc-400 mb-2">Buckets</p>
              <div className="flex flex-wrap gap-2">
                {problem.buckets?.map(bucket => (
                  <span
                    key={bucket.id}
                    className="px-2 py-1 rounded-full text-xs"
                    style={{
                      backgroundColor: bucket.color + '22',
                      color: bucket.color,
                    }}
                  >
                    {bucket.name}
                  </span>
                ))}
              </div>
            </div>

            <button className="w-full px-4 py-2 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition">
              + Add Tag
            </button>
          </div>
        </div>

        {/* Right: Problem Statement & Notes */}
        <div className="lg:col-span-2">
          {/* Problem Statement */}
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 mb-6">
            <h2 className="text-lg font-semibold text-zinc-100 mb-4">Problem Statement</h2>
            <div className="bg-zinc-800 p-4 rounded h-64 overflow-y-auto text-zinc-300 text-sm">
              {problem.statement || 'No statement available'}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-zinc-100">Notes</h2>
              {!isEditingNotes && (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-sm px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-40 p-3 rounded bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="Add your notes here..."
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleSaveNotes}
                    className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingNotes(false)}
                    className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="text-zinc-300 whitespace-pre-wrap">
                {notes || <span className="text-zinc-500 italic">No notes yet</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProblemDetail
