import { useState, useEffect } from 'react'
import { profileUpdateSchema, type ProfileUpdateRequest, type AuthUser } from '@simple-todo/shared'
import { useAuth } from '../../hooks/useAuth'

interface FormErrors {
  email?: string
  name?: string
  submit?: string
}

interface ProfileFormProps {
  onSuccess?: () => void
}

export default function ProfileForm({ onSuccess }: ProfileFormProps) {
  const { user, session } = useAuth()
  const [formData, setFormData] = useState<ProfileUpdateRequest>({
    email: '',
    name: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')

  // Load current profile data
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        name: user.name || ''
      })
      setIsLoadingProfile(false)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    setSuccessMessage('')

    try {
      // Validate form data
      const validation = profileUpdateSchema.safeParse(formData)
      
      if (!validation.success) {
        const fieldErrors: FormErrors = {}
        validation.error.errors.forEach((error) => {
          const field = error.path[0] as keyof FormErrors
          fieldErrors[field] = error.message
        })
        setErrors(fieldErrors)
        setIsLoading(false)
        return
      }

      if (!session) {
        setErrors({ submit: 'Authentication required. Please log in again.' })
        setIsLoading(false)
        return
      }

      // Submit profile update (cookies sent automatically)
      const response = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      })

      const result = await response.json()

      if (result.success) {
        setSuccessMessage('Profile updated successfully!')
        if (onSuccess) {
          onSuccess()
        }
      } else {
        if (result.details) {
          const fieldErrors: FormErrors = {}
          result.details.forEach((detail: { field: string; message: string }) => {
            fieldErrors[detail.field as keyof FormErrors] = detail.message
          })
          setErrors(fieldErrors)
        } else {
          setErrors({ submit: result.error || 'Profile update failed' })
        }
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
    
    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage('')
    }
  }

  if (isLoadingProfile) {
    return (
      <div className="max-w-md w-full bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-6"></div>
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-6"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        <p className="mt-1 text-sm text-gray-600">
          Update your account information
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {errors.submit && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {successMessage && (
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <div className="mt-1">
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Email changes require verification
          </p>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          >
            {isLoading ? 'Updating Profile...' : 'Update Profile'}
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-600">
          <strong>Privacy:</strong> Your information is kept secure and private.
        </p>
      </div>
    </div>
  )
}