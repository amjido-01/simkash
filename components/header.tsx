import {
  Avatar,
  AvatarFallbackText,
  AvatarImage,
} from "@/components/ui/avatar";
import { Box } from "@/components/ui/box";
import { Button, ButtonIcon } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { useAuthStore } from "@/store/auth-store";
import { Bell } from "lucide-react-native";
import React from "react";

export default function Header() {
  const { user, signOut } = useAuthStore();
  // console.log(user, "from header")

   const handleLogout = async () => {
    try {
      await signOut();
      // Navigation is handled automatically by useProtectedRoute
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  return (
    <Box className={"border-[#E9EAEB] px-6 py-4"}>
      <HStack className={"items-center justify-between"}>
        <HStack space={"sm"}>
          <Avatar size="md">
            <AvatarFallbackText>Jane Doe</AvatarFallbackText>
            <AvatarImage
              source={{
                uri: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8dXNlcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=800&q=60",
              }}
            />
          </Avatar>
        </HStack>
          <Button 
            onPress={handleLogout}
          action={"default"} className={"mr2 p-[8px] rounded-[99%] bg-[#F4F5F8]"}>
            <ButtonIcon
              className={"text-gray-300"}
              as={() => {
                return <Bell className=" w-[40px] h-[40px]" />;
              }}
            ></ButtonIcon>
          </Button>
      </HStack>
    </Box>
  );
}
