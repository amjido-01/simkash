import { Link } from "expo-router";
import { View, Text } from "react-native";
import { Button } from "@/components/ui/button";

export default function SignIn() {
  return (
    <View className="flex-1 items-center justify-center px-6 bg-white">
      <Text className="text-[18px] leading-[28px] tracking[60px]  font-manropesemibold text-[#000000] mb-8">Create your Account</Text>

     <View>
      
     </View>

      <Link href="/(auth)/signup" asChild>
        <Text className="text-blue-500 mt-6">Dont have an account? Sign Up</Text>
      </Link>
    </View>
  );
}
