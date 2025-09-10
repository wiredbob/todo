export * from './types';
export * from './utils';
export * from './constants/index';
export * from './security/task-validation';

// Export only auth types and schemas (no services/supabase client for browser)
export type { 
  LoginRequest, 
  RegisterRequest, 
  ProfileUpdateRequest, 
  PasswordResetRequest, 
  PasswordUpdateRequest,
  User as AuthUser,
  AuthSession,
  AuthResponse,
  ProfileResponse
} from './types/auth';
export { 
  loginSchema,
  registerSchema,
  profileUpdateSchema,
  passwordResetSchema,
  passwordUpdateSchema
} from './types/auth';