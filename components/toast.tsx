// components/Alert/Toast.tsx
import { Alert, AlertText } from '@/components/ui/alert';
import { VStack } from '@/components/ui/vstack';
import { Icon, CloseIcon } from '@/components/ui/icon';
import { Pressable } from 'react-native';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react-native';

interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

// Fix: Use proper type assertion for action prop
const actionMap: Record<ToastProps['type'], 'success' | 'error' | 'warning' | 'info'> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

export function Toast({ type, message, onClose }: ToastProps) {
  const IconComponent = iconMap[type];
  const action = actionMap[type]; // Now properly typed
  
  return (
    <Alert
      action={action} // This will now be properly typed
      className="gap-4 max-w-[585px] w-full self-center items-start min-[400px]:items-center mb-4"
    >
      <Icon as={IconComponent} className="mt-0.5" />
      <VStack className="gap-2 flex-1">
        <AlertText className="font-semibold text-typography-900" size="sm">
          {message}
        </AlertText>
      </VStack>
      {onClose && (
        <Pressable onPress={onClose}>
          <Icon as={CloseIcon} />
        </Pressable>
      )}
    </Alert>
  );
}