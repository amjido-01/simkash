import {
  ArrowUp,
  ArrowUpRight,
  Banknote,
  CreditCard,
  Eye,
  LayoutDashboard,
  Lightbulb,
  PhoneCall,
  PhoneMissed,
  Store,
  Wifi,
} from "lucide-react-native";

// Payment action data
export const quickActions = [
  { id: 0, icon: ArrowUp, label: "Top Up", heading: "Top Up Wallet", color: "#006AB1" },
  { id: 1, icon: ArrowUpRight, label: "Send", heading: "Choose Transfer Type", color: "#066042" },
];

export const paymentOptions = [
  {
    id: 1,
    icon: PhoneMissed,
    label: "Airtime",
    iconColor: "#D257E5",
  },
  {
    id: 2,
    icon: Wifi,
    label: "Data Bundle",
    iconColor: "#00C53E",
  },
  {
    id: 3,
    icon: CreditCard,
    label: "Request SIM",
    iconColor: "#D4BF00",
  },
  {
    id: 4,
    icon: Store,
    label: "Request POS",
    iconColor: "#D98014",
  },
  {
    id: 5,
    icon: Banknote,
    label: "Data2cash",
    iconColor: "#1400C5",
  },
  {
    id: 6,
    icon: LayoutDashboard,
    label: "More",
    iconColor: "#D7561EDB",
  },
];

export const moreServices = [
  {
    id: 0,
    icon: PhoneMissed,
    label: "Aitime2Cash",
    iconColor: "#D257E5",
  },
  {
    id: 1,
    icon: Wifi,
    label: "Cable TV",
    iconColor: "#00C53E",
  },
  {
    id: 2,
    icon: Lightbulb,
    label: "Electricity",
    iconColor: "#D4BF00",
  },
  {
    id: 3,
    icon: PhoneCall,
    label: "Esim",
    iconColor: "#D98014",
  },
  {
    id: 4,
    icon: Banknote,
    label: "Virtual Number",
    iconColor: "#1400C5",
  },
  {
    id: 7,
    icon: LayoutDashboard,
    label: "Pay Later",
    iconColor: "#D7561EDB",
  },
];