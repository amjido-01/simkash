
import React from "react";
import {
  ScrollView,
  View,
  Text,
} from "react-native";
import {
  SafeAreaView,
} from "react-native-safe-area-context";
import { router } from "expo-router";
import { PageHeader } from "@/components/page-header";


export default function Wireless() {

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* Header */}
      <PageHeader
        title="5G Wireless"
        onBack={handleBack}
        showBackButton={true}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View className="bg-white rounded-3xl p-10 items-center w-full max-w-md">
         <Text className="text-4xl font-bold text-gray-900 mb-3">
           Coming Soon
         </Text>
         <Text className="text-xl text-gray-black text-center leading-6">
           5G Wireless functionality is coming soon!, please stay tuned.
         </Text>
       </View>
      </ScrollView>
    </SafeAreaView>
  );
}