import { Link } from 'react-router-dom'
import HealthCheck from '../components/HealthCheck'
import PlaceholderCard from '../components/PlaceholderCard'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome to Simple Todo - Your task management platform
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              to="/login"
              className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Login (Placeholder)
            </Link>
          </div>
        </div>

        {/* Health Status */}
        <div className="mt-8">
          <HealthCheck />
        </div>

        {/* Coming Soon Features Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <PlaceholderCard
            title="Single Task Input"
            description="Quick task creation with smart parsing"
            storyReference="Story 1.3"
            icon="📝"
          />
          <PlaceholderCard
            title="Task Breakdown"
            description="AI-powered task decomposition"
            storyReference="Story 1.4"
            icon="🔄"
          />
          <PlaceholderCard
            title="Task Management"
            description="Full CRUD operations for tasks"
            storyReference="Story 1.5"
            icon="✅"
          />
          <PlaceholderCard
            title="Task Hierarchy"
            description="Parent-child task relationships"
            storyReference="Story 1.6"
            icon="🌳"
          />
          <PlaceholderCard
            title="Context Toggle"
            description="Switch between focused and full views"
            storyReference="Story 1.8"
            icon="🎯"
          />
          <PlaceholderCard
            title="User Authentication"
            description="Secure login and user management"
            storyReference="Story 1.2"
            icon="🔐"
          />
        </div>

        {/* Development Info */}
        <div className="mt-12 bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Development Status
            </h3>
            <div className="mt-3 max-w-3xl text-sm text-gray-500">
              <p>
                This is the basic UI boilerplate (Story 1.1c). All features shown above are placeholders 
                that will be implemented in subsequent stories. The application currently includes:
              </p>
            </div>
            <div className="mt-5">
              <div className="rounded-md bg-green-50 p-4">
                <div className="text-sm text-green-700">
                  <strong>✅ Completed:</strong>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Basic routing between login and dashboard</li>
                    <li>Responsive design with Tailwind CSS</li>
                    <li>Backend API health check integration</li>
                    <li>Professional placeholder components</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}