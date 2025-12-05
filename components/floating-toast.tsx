// components/Alert/FloatingToast.tsx
import { Alert, AlertText } from '@/components/ui/alert';
import { Icon, CloseIcon } from '@/components/ui/icon';
import { Pressable, Animated, StyleSheet } from 'react-native';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react-native';
import { useEffect, useRef } from 'react';

interface FloatingToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  position?: 'top' | 'bottom';
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const actionMap: Record<FloatingToastProps['type'], 'success' | 'error' | 'warning' | 'info'> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

export function FloatingToast({ type, message, onClose, position = 'top' }: FloatingToastProps) {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [slideAnim]);

  const IconComponent = iconMap[type];
  const action = actionMap[type]; // Properly typed

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? styles.top : styles.bottom,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Alert
        action={action} // Now properly typed
        className="gap-4 w-full items-center flex-row px-4 py-3"
      >
        <Icon as={IconComponent} size="sm" />
        <AlertText className="font-semibold flex-1" size="sm">
          {message}
        </AlertText>
        {onClose && (
          <Pressable onPress={onClose}>
            <Icon as={CloseIcon} size="sm" />
          </Pressable>
        )}
      </Alert>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
  },
  top: {
    top: 60,
  },
  bottom: {
    bottom: 60,
  },
});