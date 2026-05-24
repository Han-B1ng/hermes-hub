interface StatCardProps {
  label: string
  value: string | number
  accent?: string
}

export default function StatCard({ label, value, accent = 'bg-blue-500' }: StatCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className={`w-8 h-1 ${accent} rounded-full mb-3`} />
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}
