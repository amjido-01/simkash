import { ArrowUp, ArrowUpRight, Building2, FileText, Landmark } from "lucide-react-native";

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