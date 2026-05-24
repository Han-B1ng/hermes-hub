import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getReplay, type TaskEvent } from '../api/client'
import TimelineItem from '../components/TimelineItem'
import ReplayControls from '../components/ReplayControls'

export default function ReplayViewer() {
  const { id } = useParams<{ id: string }>()
  const [events, setEvents] = useState<TaskEvent[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    getReplay(id).then(setEvents)
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentIndex])

  useEffect(() => {
    if (isPlaying) {
      const ms = 1000 / speed
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= events.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, ms)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, speed, events.length])

  const handlePlay = useCallback(() => {
    if (currentIndex >= events.length - 1) setCurrentIndex(0)
    setIsPlaying(true)
  }, [currentIndex, events.length])

  const handlePause = useCallback(() => setIsPlaying(false), [])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, events.length - 1))
  }, [events.length])

  const visibleEvents = events.slice(0, currentIndex + 1)

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col">
      <div className="p-6 flex items-center gap-4">
        <Link to="/tasks" className="text-gray-400 hover:text-gray-200 text-sm">&larr; Tasks</Link>
        <h1 className="text-xl font-bold">Replay</h1>
        <span className="text-sm text-gray-500 font-mono">{id}</span>
      </div>
      <div className="flex-1 overflow-y-auto px-6 max-w-2xl">
        {visibleEvents.length === 0 ? (
          <p className="text-gray-500">Press Play to start replay.</p>
        ) : (
          visibleEvents.map((e) => <TimelineItem key={e.id} event={e} />)
        )}
        <div ref={bottomRef} />
      </div>
      <ReplayControls
        isPlaying={isPlaying}
        speed={speed}
        currentIndex={currentIndex}
        total={events.length}
        onPlay={handlePlay}
        onPause={handlePause}
        onSpeedChange={setSpeed}
        onNext={handleNext}
      />
    </div>
  )
}
