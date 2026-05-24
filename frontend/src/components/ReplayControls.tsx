interface ReplayControlsProps {
  isPlaying: boolean
  speed: number
  currentIndex: number
  total: number
  onPlay: () => void
  onPause: () => void
  onSpeedChange: (speed: number) => void
  onNext: () => void
}

const SPEEDS = [1, 2, 5]

export default function ReplayControls({
  isPlaying,
  speed,
  currentIndex,
  total,
  onPlay,
  onPause,
  onSpeedChange,
  onNext,
}: ReplayControlsProps) {
  const progress = total > 0 ? ((currentIndex + 1) / total) * 100 : 0

  return (
    <div className="bg-gray-800 border-t border-gray-700 p-4">
      <div className="w-full h-1 bg-gray-700 rounded-full mb-4">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-sm font-medium"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          onClick={onNext}
          disabled={isPlaying || currentIndex >= total - 1}
          className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          Next
        </button>
        <div className="flex items-center gap-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-1 rounded text-xs font-mono ${
                speed === s ? 'bg-gray-600 text-white' : 'bg-gray-700 text-gray-400 hover:text-gray-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-gray-500">
          {currentIndex + 1} / {total}
        </span>
      </div>
    </div>
  )
}
