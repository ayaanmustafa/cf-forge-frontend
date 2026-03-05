const ProblemCard = ({ problem, onAddTag, onAddBucket, onAddNote, onRemoveTag, onViewNote }) => {
  const getRatingColor = (rating) => {
    if (rating < 1200) return 'bg-zinc-600'
    if (rating < 1600) return 'bg-blue-600'
    if (rating < 2000) return 'bg-purple-600'
    if (rating < 2400) return 'bg-orange-600'
    return 'bg-red-600'
  }

  const getCodeforcesLink = () => {
    if (problem.contest_id && problem.index) {
      return `https://codeforces.com/problemset/problem/${problem.contest_id}/${problem.index}`
    }
    return null
  }

  return (
    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-bold text-white ${getRatingColor(problem.rating)}`}>
              {problem.rating}
            </span>
            <h3 className="text-lg font-semibold text-zinc-100">{problem.name}</h3>
          </div>
          <p className="text-sm text-zinc-400">Contest: {problem.contest_id}</p>
        </div>
      </div>

      {/* Note Preview */}
      {problem.user_note && (
        <button
          onClick={() => onViewNote?.(problem.id)}
          className="w-full mb-3 p-2 bg-amber-900 bg-opacity-20 rounded text-amber-200 text-xs border border-amber-700 border-opacity-30 hover:border-amber-700 transition text-left"
        >
          <p className="font-semibold mb-1">Note:</p>
          <p className="line-clamp-3 whitespace-pre-wrap font-mono text-xs">
  {problem.user_note}
</p>
          <p className="text-amber-300 text-xs mt-1 italic">Click to expand</p>
        </button>
      )}

      {/* Tags */}
      {problem.tags && problem.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {problem.tags.map(problemTag => {
            const tag = problemTag.tag || problemTag;
            return (
              <button
                key={tag.id}
                onClick={() => onRemoveTag?.(problem.id, tag.id)}
                className="px-2 py-1 rounded-full text-xs transition hover:opacity-75 relative group"
                style={{
                  backgroundColor: tag.color + '22',
                  color: tag.color,
                  border: `1px solid ${tag.color}44`
                }}
              >
                {tag.name}
                <span className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition cursor-pointer">
                  ✕
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Buckets */}
      {problem.buckets && problem.buckets.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {problem.buckets.map(bucket => (
            <span
              key={bucket.id}
              className="px-2 py-1 rounded-full text-xs transition"
              style={{
                backgroundColor: bucket.color + '22',
                color: bucket.color,
                border: `1px solid ${bucket.color}44`
              }}
            >
              📦 {bucket.name}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {getCodeforcesLink() && (
          <a
            href={getCodeforcesLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1 rounded bg-cyan-700 hover:bg-cyan-600 text-white transition"
          >
            🔗 See Problem
          </a>
        )}
        <button
          onClick={() => onAddTag?.(problem.id)}
          className="text-xs px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
        >
          + Tag
        </button>
        <button
          onClick={() => onAddBucket?.(problem.id)}
          className="text-xs px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
        >
          + Bucket
        </button>
        <button
          onClick={() => onAddNote?.(problem.id)}
          className="text-xs px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
        >
          {problem.user_note ? '📝 Edit' : '📝 Note'}
        </button>
      </div>
    </div>
  )
}

export default ProblemCard
