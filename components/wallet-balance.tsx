// components/wallet-balance.tsx
import { useAuthStore } from '@/store/auth-store';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { TouchableOpacity } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

interface WalletBalanceProps {
  balance?: string | number; // Make it optional and accept number too
  size?: 'sm' | 'md' | 'lg';
}

export function WalletBalance({ balance = "0", size = 'lg' }: WalletBalanceProps) {
  const { showBalance, toggleShowBalance } = useAuthStore();
  
  const fontSize = size === 'lg' ? 'text-[38px]' : size === 'md' ? 'text-[24px]' : 'text-[16px]';
  const iconSize = size === 'lg' ? 24 : size === 'md' ? 20 : 16;

  // Format balance - handle both string and number
  const formattedBalance = typeof balance === 'number' 
    ? balance.toLocaleString() 
    : parseFloat(balance || "0").toLocaleString();

  return (
    <HStack className="items-center gap-3">
      {showBalance ? (
        <Heading className={`text-[#141316] font-manropesemibold ${fontSize}`}>
          ₦ {formattedBalance}
        </Heading>
      ) : (
        <Heading className={`text-[#141316] font-manropesemibold ${fontSize}`}>
          ₦ ••••••
        </Heading>
      )}
      <TouchableOpacity className="p-2" onPress={toggleShowBalance}>
        {showBalance ? (
          <Eye size={iconSize} color="#6B7280" />
        ) : (
          <EyeOff size={iconSize} color="#6B7280" />
        )}
      </TouchableOpacity>
    </HStack>
  );
}