import { ReactNode } from 'react'
import Navigation from './Navigation'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Simple Todo v1.0.0 - Story 1.1c Basic UI Boilerplate
            </p>
            <div className="flex space-x-6 text-sm text-gray-500">
              <span>Development Mode</span>
              <span>•</span>
              <span>Node.js 22.x</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}