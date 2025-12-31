import {
  ArrowUp,
  ArrowUpRight,
  Banknote,
  CreditCard,
  LayoutDashboard,
  Lightbulb,
  PhoneCall,
  PhoneMissed,
  Store,
  Tv,
  Wifi,
  Zap,
} from "lucide-react-native";

// Payment action data
export interface MenuOption {
  id: number;
  icon: any; // Icon component from lucide-react-native
  label: string;
  iconColor?: string;
  route?: string; // route used for navigation
  params?: Record<string, any>;
}
export type PaymentCategory = {
  id: "airtime" | "data" | "electricity" | "tv";
  name: string;
  icon: any;
  iconColor: string;
  route: string;
  params?: {
    mode?: "payment" | "paylater";
    service?: string;
  };
};


export const quickActions = [
  {
    id: 0,
    icon: ArrowUp,
    label: "Top Up",
    heading: "Top Up Wallet",
    color: "#006AB1",
  },
  {
    id: 1,
    icon: ArrowUpRight,
    label: "Send",
    heading: "Choose Transfer Type",
    color: "#066042",
  },
];

export const paymentOptions: MenuOption[] = [
  {
    id: 1,
    icon: PhoneMissed,
    label: "Airtime",
    iconColor: "#D257E5",
    route: "/airtime",
    params: { mode: "payment" },
  },
  {
    id: 2,
    icon: Wifi,
    label: "Data Bundle",
    iconColor: "#00C53E",
    route: "/data",
    params: { mode: "payment" },
  },
  {
    id: 3,
    icon: CreditCard,
    label: "Request SIM",
    iconColor: "#D4BF00",
    route: "/request-sim",
  },
  {
    id: 4,
    icon: Store,
    label: "Request POS",
    iconColor: "#D98014",
    route: "/request-pos",
  },
  {
    id: 5,
    icon: Banknote,
    label: "Data2cash",
    iconColor: "#1400C5",
    route: "/data2cash",
  },
  {
    id: 6,
    icon: LayoutDashboard,
    label: "More",
    iconColor: "#D7561EDB",
    route: "/more",
  },
];

export const moreServices: MenuOption[] = [
  {
    id: 0,
    icon: PhoneMissed,
    label: "Airtime2Cash",
    iconColor: "#D257E5",
    route: "/airtime-to-cash",
    params: { mode: "payment" },
  },
  {
    id: 1,
    icon: Wifi,
    label: "Cable TV",
    iconColor: "#00C53E",
    route: "/cable-tv",
    params: { mode: "payment" },
  },
  {
    id: 2,
    icon: Lightbulb,
    label: "Electricity",
    iconColor: "#D4BF00",
    route: "/electricity",
    params: { mode: "payment" },
  },
  {
    id: 3,
    icon: PhoneCall,
    label: "Esim",
    iconColor: "#D98014",
    route: "/esim",
  },
  {
    id: 4,
    icon: Banknote,
    label: "Virtual Number",
    iconColor: "#1400C5",
    route: "/virtual-number",
  },
  {
    id: 7,
    icon: LayoutDashboard,
    label: "Pay Later",
    iconColor: "#D7561EDB",
    route: "/pay-later",
  },
];

export const paymentCategories: PaymentCategory[] = [
  {
    id: "airtime",
    name: "Airtime",
    icon: PhoneMissed,
    iconColor: "#EC4899",
    route: "/airtime",
    params: {
      mode: "paylater",
      service: "airtime",
    },
  },
  {
    id: "data",
    name: "Data Bundle",
    icon: Wifi,
    iconColor: "#10B981",
    route: "/data",
    params: {
      mode: "paylater",
      service: "data",
    },
  },
  {
    id: "electricity",
    name: "Electricity",
    icon: Zap,
    iconColor: "#F59E0B",
    route: "/electricity",
    params: {
      mode: "paylater",
      service: "electricity",
    },
  },
  {
    id: "tv",
    name: "TV",
    icon: Tv,
    iconColor: "#3B82F6",
    route: "/cable-tv",
    params: {
      mode: "paylater",
      service: "tv",
    },
  },
];


export const QUICK_AMOUNTS = [
  { label: "₦100", value: "100" },
  { label: "₦200", value: "200" },
  { label: "₦300", value: "300" },
  { label: "₦400", value: "400" },
  { label: "₦500", value: "500" },
  { label: "₦1000", value: "1000" },
  { label: "₦1500", value: "1500" },
  { label: "₦2000", value: "2000" },
];

export const PIN_LENGTH = 4;

export const GENDER = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
  { label: "Prefer not to say", value: "prefer_not_to_say" },
];

export const ACCOUNT_VERIFICATION_DELAY = 500;
