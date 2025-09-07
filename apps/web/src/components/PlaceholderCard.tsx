interface PlaceholderCardProps {
  title: string
  description: string
  storyReference: string
  icon?: string
}

export default function PlaceholderCard({ 
  title, 
  description, 
  storyReference, 
  icon = "🚀" 
}: PlaceholderCardProps) {
  return (
    <div className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400 hover:shadow-md transition-all duration-200">
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          Coming in {storyReference}
        </div>
      </div>
      
      {/* Overlay to indicate disabled state */}
      <div className="absolute inset-0 bg-gray-50 bg-opacity-30 rounded-lg pointer-events-none" />
    </div>
  )
}