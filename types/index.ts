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

export interface CompleteProfileData extends ProfileFormData, PinFormData, PasscodeFormData {}