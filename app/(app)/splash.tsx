import { View, Animated, Easing } from "react-native";
import { useEffect, useRef } from "react";

export default function Splash() {
  const scaleAnim = useRef(new Animated.Value(0.2)).current; // start tiny

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: 1.2,        // zoom bigger smoothly
      duration: 1600,       // slower → smoother
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Animated.Image
        source={require("../../assets/images/splash.png")}
        resizeMode="contain"
        style={{
          width: 160,
          height: 160,
          transform: [{ scale: scaleAnim }],
        }}
      />
    </View>
  );
}
