// components/CustomAlert.tsx
import { Alert, AlertText } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { X } from "lucide-react-native";

interface CustomAlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose: () => void;
}

const alertStyles = {
  success: {
    container: "border-green-500 bg-green-50",
    text: "text-green-700",
  },
  error: {
    container: "border-red-500 bg-red-50",
    text: "text-red-700",
  },
  warning: {
    container: "border-orange-500 bg-orange-50",
    text: "text-orange-700",
  },
  info: {
    container: "border-blue-500 bg-blue-50",
    text: "text-blue-700",
  },
};

export function CustomAlert({ type, message, onClose }: CustomAlertProps) {
  const styles = alertStyles[type];
  
  return (
    <Alert action={type} className={`mb-4 ${styles.container}`}>
      <AlertText className={`flex-1 ${styles.text}`}>
        {message}
      </AlertText>
      <Pressable onPress={onClose}>
        <Icon as={X} className={styles.text} />
      </Pressable>
    </Alert>
  );
}