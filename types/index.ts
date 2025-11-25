// Type definitions for the complete profile data
export interface ProfileFormData {
  fullName: string;
  phoneNumber: string;
  gender: string;
  dateOfBirth: string;
  country: string;
}

export interface PinFormData {
  newPin: string;
  confirmPin: string;
}

export interface PasscodeFormData {
  newPasscode: string;
  confirmPasscode: string;
}

export interface StepProps<T> {
  onNext: (data: T) => void;
  onBack?: () => void;
  initialData?: Partial<CompleteProfileData>;
}

export interface CompleteProfileData
  extends ProfileFormData,
    PinFormData,
    PasscodeFormData {}

export interface ApiResponse<T = any> {
  responseSuccessful: boolean;
  responseMessage: string;
  responseBody: T;
}

// Auth response types
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

// Custom error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}