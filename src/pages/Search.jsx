import { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { fetchSolvedProblems, searchAllProblems, trackUnsolvedProblem } from '../api/problems'
import ProblemCard from '../components/ProblemCard'
import Modal from '../components/Modal'
import TagSelector from '../components/TagSelector'
import NoteModal from '../components/NoteModal'
import Notification, { useNotification } from '../components/Notification'
import { removeTagFromProblem, fetchTags } from '../api/tags'

const Search = () => {
  const { user } = useUser()
  const { notification, showNotification } = useNotification()
  const [searchTerm, setSearchTerm] = useState('')
  const [mode, setMode] = useState('solved') // 'solved', 'all', or 'unsolved'
  const [filters, setFilters] = useState({
    ratingMin: 800,
    ratingMax: 3500,
    contestId: '',
  })
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [allProblems, setAllProblems] = useState([])
  const [solvedProblems, setSolvedProblems] = useState([])
  const [solvedProblemIds, setSolvedProblemIds] = useState(new Set())
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [modalType, setModalType] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [itemsPerPage] = useState(30)
  const [totalProblems, setTotalProblems] = useState(0)

  // Load all problems on mount
  useEffect(() => {
    if (user?.handle) {
      setCurrentPage(0)
      loadAllProblems(0)
    }
  }, [user?.handle, mode])

  const loadAllProblems = async (page = 0) => {
    setLoading(true)
    try {
      if (mode === 'solved') {
        // Load solved problems
        const data = await fetchSolvedProblems(user.handle, {
          ratingMin: 800,
          ratingMax: 3500,
        })
        setAllProblems(Array.isArray(data) ? data : [])
        setResults(Array.isArray(data) ? data : [])
        setTotalProblems(data.length)
        setSolvedProblemIds(new Set())
      } else {
        // Get user's solved problems first
        const solvedData = await fetchSolvedProblems(user.handle, {
          ratingMin: 800,
          ratingMax: 3500,
        })
        
        setSolvedProblems(solvedData)
        const solvedIds = new Set(solvedData.map(sp => `${sp.problem.contest_id}-${sp.problem.index}`))
        setSolvedProblemIds(solvedIds)
        
        const contestId = filters.contestId ? parseInt(filters.contestId) : null
        const name = searchTerm || null
        
        if (mode === 'unsolved') {
          // For unsolved: load all and filter to get enough unsolved problems
          const response = await searchAllProblems(800, 3500, page * 300, 300, contestId, name)
          const unsolvedData = response.problems.filter(p => !solvedIds.has(`${p.contest_id}-${p.index}`))
          
          setAllProblems(unsolvedData)
          setResults(unsolvedData)
          // Calculate total unsolved (approximate, since we're filtering)
          const approxUnsolved = Math.floor(response.total * 0.8) // assume 80% unsolved
          setTotalProblems(approxUnsolved)
        } else {
          // All problems: normal pagination
          const response = await searchAllProblems(800, 3500, page * itemsPerPage, itemsPerPage, contestId, name)
          setAllProblems(Array.isArray(response.problems) ? response.problems : [])
          setResults(Array.isArray(response.problems) ? response.problems : [])
          setTotalProblems(response.total)
        }
      }
    } catch (err) {
      console.error('Error loading problems:', err)
      showNotification('Failed to load problems', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(0)
    setLoading(true)
    try {
      // If contest ID or search term is set and not in solved mode, reload from API
      if ((filters.contestId || searchTerm) && mode !== 'solved') {
        loadAllProblems(0)
        return
      }

      let filtered = allProblems

      // Filter by search term (problem name or problem index)
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        if (mode === 'solved') {
          filtered = filtered.filter(sp =>
            sp.problem.name.toLowerCase().includes(term) ||
            sp.problem.index.toLowerCase().includes(term)
          )
        } else {
          // For 'all' and 'unsolved' modes
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(term) ||
            p.index.toLowerCase().includes(term)
          )
        }
      }

      // Filter by rating
      filtered = filtered.filter(p => {
        const rating = mode === 'solved' ? p.problem.rating : p.rating
        return rating >= parseInt(filters.ratingMin || 800) &&
               rating <= parseInt(filters.ratingMax || 3500)
      })

      // Filter by contest ID (client-side only for solved mode)
      if (filters.contestId && mode === 'solved') {
        filtered = filtered.filter(p => {
          return p.problem.contest_id.toString() === filters.contestId
        })
      }

      setResults(filtered)
    } catch (err) {
      showNotification('Search failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = (problemId) => {
    const problem = results.find(p => p.id === problemId)
    setSelectedProblem(problem)
    setModalType('tagSelector')
  }

  const handleAddNote = (problemId) => {
    const problem = results.find(p => p.id === problemId)
    setSelectedProblem(problem)
    setModalType('note')
  }

  const handleViewNote = (problemId) => {
    const problem = results.find(p => p.id === problemId)
    setSelectedProblem(problem)
    setModalType('viewNote')
  }

  const handleRemoveTag = async (problemId, tagId) => {
    if (!window.confirm('Remove this tag?')) return
    try {
      await removeTagFromProblem(problemId, tagId)
      showNotification('✓ Tag removed', 'success')
      await loadAllProblems()
    } catch (error) {
      showNotification('Failed to remove tag', 'error')
    }
  }

  const handleTrackProblem = async (problem) => {
    try {
      setLoading(true)
      await trackUnsolvedProblem(user.handle, problem)
      showNotification('✓ Problem added to your tracking list!', 'success')
      
      // Mark as solved/tracked
      const key = `${problem.contest_id}-${problem.index}`
      setSolvedProblemIds(prev => new Set([...prev, key]))
      
      // Reload current page to show updated state
      await loadAllProblems(currentPage)
    } catch (error) {
      if (error.response?.status === 400) {
        showNotification('Already tracking this problem', 'error')
      } else {
        showNotification('Failed to add problem', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    setModalType(null)
    setSelectedProblem(null)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-zinc-100">Search Problems</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('solved')}
            className={`px-4 py-2 rounded ${mode === 'solved' 
              ? 'bg-blue-500 text-white' 
              : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
          >
            ✓ Solved by Me
          </button>
          <button
            onClick={() => setMode('unsolved')}
            className={`px-4 py-2 rounded ${mode === 'unsolved' 
              ? 'bg-blue-500 text-white' 
              : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
          >
            ❌ Unsolved Only
          </button>
          <button
            onClick={() => setMode('all')}
            className={`px-4 py-2 rounded ${mode === 'all' 
              ? 'bg-blue-500 text-white' 
              : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'}`}
          >
            📚 All Problems
          </button>
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-2">Problem Name or Index</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by name or problem index..."
              className="w-full px-3 py-2 rounded bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-2">Contest ID (optional)</label>
            <input
              type="number"
              value={filters.contestId}
              onChange={(e) => setFilters({...filters, contestId: e.target.value})}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g., 1234"
              className="w-full px-3 py-2 rounded bg-white border border-gray-300 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-zinc-400 block mb-2">Min Rating</label>
            <input
              type="number"
              min="800"
              max="3500"
              value={filters.ratingMin}
              onChange={(e) => setFilters({...filters, ratingMin: e.target.value})}
              className="w-full px-3 py-2 rounded bg-white border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-zinc-400 block mb-2">Max Rating</label>
            <input
              type="number"
              min="800"
              max="3500"
              value={filters.ratingMax}
              onChange={(e) => setFilters({...filters, ratingMax: e.target.value})}
              className="w-full px-3 py-2 rounded bg-white border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full px-6 py-2 rounded bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold transition"
        >
          {loading ? '🔍 Searching...' : '🔍 Search'}
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center text-zinc-400">Loading problems...</div>
      ) : results.length === 0 ? (
        <div className="text-center text-zinc-400 py-12">
          {allProblems.length === 0 ? 'No problems loaded. Try switching tabs or adjusting filters.' : 'No results found. Try adjusting your search criteria.'}
        </div>
      ) : (
        <div>
          <p className="text-sm text-zinc-400 mb-4">
            {mode === 'unsolved' ? `Showing ${results.length} unsolved problems` : `${results.length} results found`}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((item, idx) => {
              if (mode === 'solved') {
                // Solved problems structure
                const problemData = {
                  id: item.id,
                  ...item.problem,
                  user_note: item.user_note,
                  tags: item.tags || [],
                  buckets: item.buckets || []
                }
                return (
                  <ProblemCard
                    key={item.id}
                    problem={problemData}
                    onAddTag={handleAddTag}
                    onAddBucket={() => {}}
                    onAddNote={handleAddNote}
                    onRemoveTag={handleRemoveTag}
                    onViewNote={handleViewNote}
                  />
                )
              } else {
                // All problems - simple card with just add button
                const isTracked = solvedProblemIds.has(`${item.contest_id}-${item.index}`)
                return (
                  <div key={idx} className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 hover:border-zinc-600 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm text-zinc-400">
                          #{item.contest_id}{item.index}
                        </p>
                        <h3 className="font-semibold text-white text-sm line-clamp-2">{item.name}</h3>
                      </div>
                      {item.rating && (
                        <span className={`px-2 py-1 rounded text-xs font-bold text-white flex-shrink-0 ${
                          item.rating < 1200 ? 'bg-blue-600' :
                          item.rating < 1600 ? 'bg-purple-600' :
                          item.rating < 2000 ? 'bg-orange-600' :
                          item.rating < 2400 ? 'bg-red-600' : 'bg-red-700'
                        }`}>
                          {item.rating}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => window.open(`https://codeforces.com/problemset/problem/${item.contest_id}/${item.index}`, '_blank')}
                        className="flex-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition"
                      >
                        See Problem
                      </button>
                      <button
                        onClick={() => handleTrackProblem(item)}
                        disabled={isTracked || loading}
                        className={`flex-1 px-2 py-1 text-white text-sm rounded transition ${
                          isTracked 
                            ? 'bg-gray-500 cursor-not-allowed' 
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {isTracked ? '✓ Tracked' : '➕ Add'}
                      </button>
                    </div>
                  </div>
                )
              }
            })}
          </div>

          {/* Pagination controls - only for unsolved/all modes */}
          {mode !== 'solved' && (
            <div className="flex justify-between items-center mt-6 px-4 py-3 bg-zinc-900 rounded-lg border border-zinc-800">
              <button
                onClick={() => loadAllProblems(currentPage - 1)}
                disabled={currentPage === 0 || loading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white rounded transition"
              >
                ← Previous
              </button>
              <span className="text-zinc-400">
                Page {currentPage + 1} | Showing {Math.min((currentPage + 1) * itemsPerPage, totalProblems)} of {totalProblems} problems
              </span>
              <button
                onClick={() => loadAllProblems(currentPage + 1)}
                disabled={(currentPage + 1) * itemsPerPage >= totalProblems || loading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white rounded transition"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modals - only show in solved mode */}
      {mode === 'solved' && (
        <>
          {/* Tag Selector Modal */}
          <TagSelector
            isOpen={modalType === 'tagSelector'}
            onClose={closeModal}
            solvedId={selectedProblem?.id}
            onTagAdded={loadAllProblems}
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
                  onClick={() => setModalType('note')}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition"
                >
                  ✏️ Edit
                </button>
              </div>
            </div>
          </Modal>
        </>
      )}

      <Notification notification={notification} />
    </div>
  )
}

export default Search
