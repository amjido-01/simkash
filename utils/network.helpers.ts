// utils/network-helpers.ts

/**
 * Network mapping based on your API structure
 */
export const NETWORK_IDS = {
  MTN: 1,
  AIRTEL: 2,
  "9MOBILE": 3,
  ETISALAT: 3, // Same as 9mobile
  GLO: 4,
} as const;

/**
 * Map network serviceID to network ID number
 * @param serviceID - The serviceID from networks API (e.g., "mtn", "airtel")
 * @returns Network ID number (1, 2, 3, or 4)
 */
export const getNetworkId = (serviceID: string): number => {
  const normalized = serviceID.toLowerCase().trim();

  switch (normalized) {
    case "mtn":
      return NETWORK_IDS.MTN;
    case "airtel":
      return NETWORK_IDS.AIRTEL;
    case "etisalat":
    case "9mobile":
      return NETWORK_IDS["9MOBILE"];
    case "glo":
      return NETWORK_IDS.GLO;
    default:
      throw new Error(`Unknown network serviceID: ${serviceID}`);
  }
};

/**
 * Get network name from ID
 * @param networkId - The network ID (1, 2, 3, or 4)
 * @returns Network name
 */
export const getNetworkName = (networkId: number): string => {
  switch (networkId) {
    case 1:
      return "MTN";
    case 2:
      return "Airtel";
    case 3:
      return "9mobile";
    case 4:
      return "GLO";
    default:
      return "Unknown";
  }
};

/**
 * Validate network data before purchase
 */
export const validateNetworkData = (
  phone: string,
  amount: number,
  networkId: number,
  pin: string
): { isValid: boolean; error?: string } => {
  // Phone validation
  if (!phone || phone.length !== 11) {
    return { isValid: false, error: "Phone number must be 11 digits" };
  }

  // Amount validation
  if (!amount || amount < 100) {
    return { isValid: false, error: "Minimum amount is ₦100" };
  }

  if (amount > 500000) {
    return { isValid: false, error: "Maximum amount is ₦500,000" };
  }

  // Network validation
  if (![1, 2, 3, 4].includes(networkId)) {
    return { isValid: false, error: "Invalid network selected" };
  }

  // PIN validation
  if (!pin || pin.length !== 4) {
    return { isValid: false, error: "PIN must be 4 digits" };
  }

  return { isValid: true };
};