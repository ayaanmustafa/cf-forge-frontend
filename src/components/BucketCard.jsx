const BucketCard = ({ bucket, onOpen, onRename, onDelete }) => {
  return (
    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition">
      <div className="flex items-start gap-3">
        <div
          className="w-2 h-16 rounded"
          style={{ backgroundColor: bucket.color || '#3b82f6' }}
        ></div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-zinc-100">{bucket.name}</h3>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 my-3 text-xs text-zinc-400">
            <div>
              <span className="text-emerald-400 font-semibold">{bucket.solved_problems || 0}</span> solved
            </div>
            <div>
              <span className="text-rose-400 font-semibold">{bucket.unsolved_problems || 0}</span> unsolved
            </div>
            <div>
              <span className="text-blue-400 font-semibold">{bucket.total_problems || 0}</span> total
            </div>
            <div>
              <span className="text-yellow-400 font-semibold">{bucket.average_rating || 'N/A'}</span> avg rating
            </div>
          </div>
          
          <div className="flex gap-2 mt-3 flex-wrap">
            <button
              onClick={() => onOpen(bucket.id)}
              className="text-xs px-3 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition"
            >
              Open
            </button>
            <button
              onClick={() => onRename(bucket.id, bucket.name)}
              className="text-xs px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            >
              Rename
            </button>
            <button
              onClick={() => onDelete(bucket.id, bucket.name)}
              className="text-xs px-3 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BucketCard
