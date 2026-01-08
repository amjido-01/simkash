import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center px-5">
      <View className="bg-white rounded-3xl p-10 items-center w-full max-w-md">
        <View className="mb-5">
          <Text className="text-6xl">🎁</Text>
        </View>
        <Text className="text-4xl font-bold text-gray-900 mb-3">
          Coming Soon
        </Text>
        <Text className="text-base text-gray-500 text-center leading-6">
          Exciting rewards are on their way!
        </Text>
      </View>
    </SafeAreaView>
  );
}