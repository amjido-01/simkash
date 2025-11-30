import {
  ArrowUp,
  ArrowUpRight,
  Building2,
  FileText,
  Landmark,
} from "lucide-react-native";

export const transactions = [
  {
    id: 1,
    type: "Wallet Topup",
    date: "2, Apr - 11:00AM",
    amount: "$100",
    icon: ArrowUp,
    iconBg: "#F0FDF4",
    iconColor: "#10B981",
  },
  {
    id: 2,
    type: "to Yusuf A baba",
    date: "2, Apr - 11:00AM",
    amount: "$20",
    icon: ArrowUpRight,
    iconBg: "#EFF6FF",
    iconColor: "#3B82F6",
  },
];

// Add transfer options data (you can put this in your constants file)
export const transferOptions = [
  {
    id: 1,
    icon: FileText,
    title: "Simkash to Simkash",
    to: "toSimkash",
    description: "Send money instantly to any simkash user",
  },
  {
    id: 2,
    icon: Landmark,
    title: "Send to Bank Account",
    to: "toBank",
    description: "Transfer to other bank accounts",
  },
];

export const COUNTRIES = [
  { label: "Nigeria", value: "NG" },
  { label: "Ghana", value: "GH" },
  { label: "Kenya", value: "KE" },
  { label: "South Africa", value: "ZA" },
  { label: "United States", value: "US" },
  { label: "Canada", value: "CA" },
  { label: "United Kingdom", value: "UK" },
  { label: "Germany", value: "DE" },
  { label: "France", value: "FR" },
  { label: "India", value: "IN" },
];

export const COUNTRY_CODES = [
  { label: "🇳🇬 Nigeria (+234)", value: "NG", callingCode: "234" },
  { label: "🇬🇭 Ghana (+233)", value: "GH", callingCode: "233" },
  { label: "🇰🇪 Kenya (+254)", value: "KE", callingCode: "254" },
  { label: "🇿🇦 South Africa (+27)", value: "ZA", callingCode: "27" },
  { label: "🇺🇸 United States (+1)", value: "US", callingCode: "1" },
  { label: "🇨🇦 Canada (+1)", value: "CA", callingCode: "1" },
  { label: "🇬🇧 United Kingdom (+44)", value: "UK", callingCode: "44" },
  { label: "🇩🇪 Germany (+49)", value: "DE", callingCode: "49" },
  { label: "🇫🇷 France (+33)", value: "FR", callingCode: "33" },
  { label: "🇮🇳 India (+91)", value: "IN", callingCode: "91" },
];
