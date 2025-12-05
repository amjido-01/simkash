// app/(onboarding)/_layout.tsx
import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';

function ProgressBar() {
  const pathname = usePathname();
  
  // Calculate progress based on current screen
  const getProgress = () => {
    if (pathname.includes('basic-info')) return 50;
    if (pathname.includes('set-pin')) return 100;
    return 0;
  };
  
  const progress = getProgress();
  
  return (
    <View 
      style={{ 
        height: 4, 
        width: '100%', 
        backgroundColor: '#E5E7EB',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <View 
        style={{ 
          height: 4, 
          width: `${progress}%`, 
          backgroundColor: '#132939',
        //   transition: 'width 0.3s ease',
        }} 
      />
    </View>
  );
}

export default function OnboardingLayout() {
  return (
    <>
      <ProgressBar />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: false, // Prevent accidental swipe back
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}
      >
        <Stack.Screen 
          name="basic-info"
          options={{
            title: 'Basic Information',
          }}
        />
        <Stack.Screen 
          name="set-pin"
          options={{
            title: 'Set PIN',
          }}
        />
      </Stack>
    </>
  );
}