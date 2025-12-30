import {
  Avatar,
  AvatarFallbackText,
} from "@/components/ui/avatar";
import { Badge, BadgeText, BadgeIcon } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useAuthStore } from "@/store/auth-store";
import { Bell, Award } from "lucide-react-native";
import React from "react";
import { View, ActivityIndicator } from "react-native";

export default function Header() {
  const { user, userProfile, signOut } = useAuthStore();
  
  // Check if profile is loaded
  const isProfileLoaded = !!userProfile?.fullname;
  
  // Get user initials from fullname
  const getUserInitials = () => {
    if (!userProfile?.fullname) return "";
    
    const names = userProfile.fullname.trim().split(" ");
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return userProfile.fullname.substring(0, 2).toUpperCase();
  };

  // Get display name
  const getDisplayName = () => {
    return userProfile?.fullname || "";
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Box className="border-[#E9EAEB] px-6 py-4">
      <HStack className="items-center justify-between">
        <HStack space="md" className="items-center">
          <Avatar size="md" className="bg-[#D7EFF6]">
            {isProfileLoaded ? (
              <AvatarFallbackText className="text-[#0066CC] font-manropesemibold">
                {getUserInitials()}
              </AvatarFallbackText>
            ) : (
              <ActivityIndicator size="small" color="#0066CC" />
            )}
          </Avatar>
          
          <VStack space="sm">
            <Badge 
              size="sm" 
              variant="solid" 
              action="info"
              className="bg-[#D7EFF6] self-start rounded-full"
            >
              <BadgeIcon 
                as={Award} 
                size="sm"
                className="text-[#000000]"
              />
              <BadgeText className="text-[#000000] capitalize text-[12px] font-manropesemibold ml-1">
                Tier 1
              </BadgeText>
            </Badge>
            
            {isProfileLoaded ? (
              <Text className="text-sm font-semibold font-manropesemibold text-[#000000]">
                {getDisplayName()}
              </Text>
            ) : (
              <View className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            )}
          </VStack>
        </HStack>

        <Button 
          onPress={handleLogout}
          action="default" 
          className="p-2 rounded-full bg-[#F4F5F8]"
        >
          <ButtonIcon
            as={() => <Bell size={24} color="#6B7280" />}
          />
        </Button>
      </HStack>
    </Box>
  );
}