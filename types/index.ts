
export interface RegisterPayload {
  email: string;
  password: string;
  confirm_password: string;
}

export interface RegisterResponse {
  responseSuccessful: boolean;
  responseMessage: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ProfileSetupPayload {
  fullname: string;
  phone: string;
  gender: "male" | "female" | "other";
  country: string;
  pin: string;
}


export interface ResendOtpPayload {
  email: string;
}

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
    PasscodeFormData {
  email: string; // ✅ Make email required in the complete data
}

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
  id: number;
  username: string | null;
  email: string;
  phone: string;
  password: string;
  status: string;
  pin: string | null;
  isVerified: boolean;
  source: string;
  fmcToken: string | null;
  refereshToken: string | null;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: number;
  user_id: number;
  fullname: string;
  gender: "male" | "female" | "other";
  country: string;
  currency: string;
  profile_picture: string;
  createdAt: string;
  updatedAt: string;
}

export type ProfileSetupResponse = ApiResponse<null>; 

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

export interface CountryTimezone {
  zoneName: string;
  gmtOffset: number;
  gmtOffsetName: string;
  abbreviation: string;
  tzName: string;
}

export interface Country {
  name: string;
  isoCode: string;
  flag: string;
  phonecode: string;
  currency: string;
  latitude: string;
  longitude: string;
  timezones: CountryTimezone[];
}

export interface CountryAPIResponse {
  responseSuccessful: boolean;
  responseMessage: string;
  responseBody: Country[];
}

export interface CountryPickerItem {
  label: string; // e.g., "🇳🇬 Nigeria"
  value: string; // e.g., "NG"
  flag?: string; // e.g., "🇳🇬"
}

export interface CountryCodePickerItem {
  label: string; // e.g., "🇳🇬 +234"
  callingCode: string; // e.g., "234"
  country: string; // e.g., "Nigeria"
  flag: string; // e.g., "🇳🇬"
}

export interface Wallet {
  id: number;
  user_id: number;
  balance: string;
  commission_balance: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionMetadata {
  phone?: string;
  network?: string;
  commission?: string;
  discount_percentage?: number;
  info?: {
    phone: string;
    network: string;
  };
}

export interface Transaction {
  id: number;
  wallet_id: number;
  transaction_type: string;
  amount: string;
  transaction_reference: string;
  status: string;
  description: string;
  metadata: string; // JSON string
  recipientId: number | null;
  processed_at: string;
  createdAt: string;
  updatedAt: string;
}

export interface ParsedTransaction extends Omit<Transaction, 'metadata'> {
  metadata: TransactionMetadata;
}

export interface DashboardData {
  userDetails: User;
  isAgent: boolean;
  isSubscribed: boolean;
  isStateCordinator: boolean;
  userProfile: UserProfile;
  wallet: Wallet;
  transaction: Transaction[];
}

// types.ts
export interface AccountDetail {
  id: number;
  user_id: number;
  account_name: string;
  account_number: string;
  bank_name: string;
  bank_slug: string;
  paystack_customer_code: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransferPayload {
  account: string;
  amount: number;
  pin: string;
  narration?: string;
}

export interface TransferResponseBody {
  amount: number;
  send_to: string;
  reference: string;
  date: string;
}

export interface TransferResponse {
  responseSuccessful: boolean;
  responseMessage: string;
  responseBody: TransferResponseBody;
}


export interface Bank {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  supports_transfer: boolean;
  available_for_direct_debit: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BanksResponse {
  responseSuccessful: boolean;
  responseMessage: string;
  responseBody: Bank[];
}