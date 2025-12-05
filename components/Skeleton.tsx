import { View } from "react-native";
import React from "react";

export default function Skeleton({ className = "" }) {
  return (
    <View
      className={`bg-[#E5E7EB] rounded-md animate-pulse ${className}`}
    />
  );
}
