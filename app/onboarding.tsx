// import Onboardsvg from "@/assets/images/onboardsvg.svg";
// import { Button, ButtonText } from "@/components/ui/button";
// import { useRouter } from "expo-router";
// import React, { useRef } from "react";
// import { Image, Text, useWindowDimensions, View } from "react-native";
// import { useSharedValue } from "react-native-reanimated";
// import Carousel, {
//   ICarouselInstance,
//   Pagination,
// } from "react-native-reanimated-carousel";
// import { onboardingStorage } from "@/utils/onboardingStorage";
// import { SafeAreaView } from "react-native-safe-area-context";

// const pages = [
//   {
//     title: "Manage and Activate Device SIMs Effortlessly",
//     subtitle: "Stay connected with ease — request, activate, and manage SIMs for your POS or other devices in one seamless platform.",
//     image: require("../assets/images/slide1.gif"),
//   },
//   {
//     title: "Experience Next-Gen Wireless 5G Connectivity",
//     subtitle: "Enjoy ultra-fast, reliable, and secure 5G internet for your devices. Connect, stream, and work without limits.",
//     image: require("../assets/images/slide2.gif"),
//   },
//   {
//     title: "Pay All Your Bills in One Place",
//     subtitle:
//       "From airtime and data to electricity and TV subscriptions — handle every payment instantly and securely.",
//     image: require("../assets/images/slide6.gif"),
//   },
//   {
//     title: "Seamless Transfers & Quick Withdrawals",
//     subtitle:
//       "Send and receive money effortlessly. Enjoy instant transfers and fast withdrawals — anytime, anywhere, with total security and transparency.",
//     image: require("../assets/images/slide3.gif"),
//   },
//   {
//     title: "Buy Now, Pay Later",
//     subtitle: "Get what you need instantly and spread your payments with ease. Simple, flexible, and built to support your cash flow.",
//     image: require("../assets/images/slide4.gif"),
//   },
//   {
//     title: "SIMKASH Pro",
//     subtitle: "Enjoy commissions and premium perks designed to reward you.",
//     image: require("../assets/images/slide5.gif"),
//   },
// ];

// export default function OnboardingScreens() {
//   const router = useRouter();
//   const { width, height } = useWindowDimensions();

//   const ref = useRef<ICarouselInstance>(null);
//   const progress = useSharedValue(0);

//   const onPressPagination = (index: number) => {
//     ref.current?.scrollTo({
//       count: index - progress.value,
//       animated: true,
//     });
//   };

//   const goToSignUp = () => router.replace("/(auth)/signup");
//   const goToSignIn = () => router.replace("/(auth)/signin");

//   // Calculate responsive heights based on screen size
//   const isSmallDevice = height < 700;
//   const carouselHeight = isSmallDevice ? height * 0.55 : height * 0.6;
//   const imageHeight = isSmallDevice ? 250 : 300;
//   const svgHeight = isSmallDevice ? "35%" : "40%";

//   return (
//     <SafeAreaView
//       style={{ flex: 1, backgroundColor: "#fff" }}
//       edges={["bottom"]}
//     >
//       <View className="flex-1">
//         {/* Background SVG */}
//         <Onboardsvg
//           width="100%"
//           height={svgHeight}
//           style={{
//             position: "absolute",
//             top: -40,
//             left: 0,
//             right: 0,
//           }}
//         />

//         {/* Main Content Container */}
//         <View className="flex-1 justify-between pt-[80px]">
//           {/* Carousel Section */}
//           <View>
//             <Carousel
//               ref={ref}
//               width={width}
//               height={carouselHeight}
//               data={pages}
//               onProgressChange={progress}
//               autoPlay
//               autoPlayInterval={3500}
//               renderItem={({ item }) => (
//                 <View className="flex-1 mt-[50px]">
//                   <Image
//                     source={item.image}
//                     style={{
//                       width: width * 0.9,
//                       height: imageHeight,
//                       alignSelf: "center",
//                       borderRadius: 24,
//                       marginTop: 20,
//                       overflow: "hidden",
//                     }}
//                     resizeMode="cover"
//                   />

//                   <Text
//                     className="text-[22px] font-manroperegular text-[#000] text-center mt-[35px] px-[20px]"
//                     numberOfLines={2}
//                   >
//                     {item.title}
//                   </Text>
//                   <Text
//                     className="text-[15px] font-manroperegular text-[#4A4A4A] text-center px-[26px] mb-[10px] mt-[6px]"
//                     numberOfLines={3}
//                   >
//                     {item.subtitle}
//                   </Text>
//                 </View>
//               )}
//             />
//           </View>

//           {/* PAGINATION */}
//           <View className="items-center justify-center">
//             <Pagination.Basic
//               progress={progress}
//               data={pages}
//               dotStyle={{
//                 width: 27,
//                 height: 5,
//                 borderRadius: 5,
//                 backgroundColor: "#D7EFF6",
//                 marginTop: 20,
//               }}
//               activeDotStyle={{
//                 width: 27,
//                 height: 5,
//                 borderRadius: 5,
//                 backgroundColor: "#132939",
//               }}
//               containerStyle={{
//                 gap: 6,
//                 marginVertical: isSmallDevice ? 16 : 20,
//               }}
//               onPress={onPressPagination}
//             />
//           </View>

//           {/* BUTTONS - Fixed at bottom */}
//           <View className="px-[20px] pb-[20px]">
//             <Button
//               size="xl"
//               className="bg-[#132939] h-[52px] rounded-full mb-[12px]"
//               onPress={goToSignUp}
//             >
//               <ButtonText className="text-white font-manroperegular text-[16px]">
//                 Create Account
//               </ButtonText>
//             </Button>
//             <Button
//               size="xl"
//               className="bg-[#F4F5F8] h-[52px] rounded-full"
//               onPress={goToSignIn}
//             >
//               <ButtonText className="text-[#132939] font-manroperegular text-[16px]">
//                 Already have Account
//               </ButtonText>
//             </Button>
//           </View>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

import Onboardsvg from "@/assets/images/onboardsvg.svg";
import { Button, ButtonText } from "@/components/ui/button";
import { useRouter } from "expo-router";
import React, { useRef, useEffect, useState } from "react";
import { Image, Text, useWindowDimensions, View, ScrollView } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance, Pagination } from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";
import { onboardingStorage } from "@/utils/onboardingStorage";

// Responsive font scaler
const scaleFont = (size: number, screenWidth: number) => size * (screenWidth / 375);

const pages = [
  {
    title: "Manage and Activate Device SIMs Effortlessly",
    subtitle:
      "Stay connected with ease — request, activate, and manage SIMs for your POS or other devices in one seamless platform.",
    image: require("../assets/images/slide1.gif"),
  },
  {
    title: "Experience Next-Gen Wireless 5G Connectivity",
    subtitle:
      "Enjoy ultra-fast, reliable, and secure 5G internet for your devices. Connect, stream, and work without limits.",
    image: require("../assets/images/slide2.gif"),
  },
  {
    title: "Pay All Your Bills in One Place",
    subtitle:
      "From airtime and data to electricity and TV subscriptions — handle every payment instantly and securely.",
    image: require("../assets/images/slide6.gif"),
  },
  {
    title: "Seamless Transfers & Quick Withdrawals",
    subtitle:
      "Send and receive money effortlessly. Enjoy instant transfers and fast withdrawals — anytime, anywhere, with total security and transparency.",
    image: require("../assets/images/slide3.gif"),
  },
  {
    title: "Buy Now, Pay Later",
    subtitle: "Get what you need instantly and spread your payments with ease. Simple, flexible, and built to support your cash flow.",
    image: require("../assets/images/slide4.gif"),
  },
  {
    title: "SIMKASH Pro",
    subtitle: "Enjoy commissions and premium perks designed to reward you.",
    image: require("../assets/images/slide5.gif"),
  },
];

export default function OnboardingScreens() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const ref = useRef<ICarouselInstance>(null);
  const progress = useSharedValue(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleCreateAccount = async () => {
    await onboardingStorage.markOnboardingComplete();
    router.replace("/(auth)/signup");
  };

  const handleAlreadyHaveAccount = async () => {
    await onboardingStorage.markOnboardingComplete();
    router.replace("/(auth)/signin");
  };

  const handleSkipOnboarding = async () => {
    await onboardingStorage.markOnboardingComplete();
    router.replace("/(auth)/signin");
  };

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      await onboardingStorage.isOnboardingComplete();
      setIsLoading(false);
    };
    checkOnboardingStatus();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Define relative heights
  const svgHeight = height * 0.35;
  const carouselHeight = height * 0.45;
  const imageHeight = carouselHeight * 0.6;
  const topPadding = height * 0.05;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["bottom"]}>
      <View style={{ flex: 1 }}>
        {/* Background SVG */}
        <Onboardsvg
          width="100%"
          height={svgHeight}
          style={{ position: "absolute", top: 0, left: 0, right: 0 }}
        />

        {/* Skip Button */}
        <View style={{ position: "absolute", top: topPadding, right: 16, zIndex: 10 }}>
          <Button variant="link" size="sm" onPress={handleSkipOnboarding}>
            <ButtonText style={{ fontSize: scaleFont(14, width), color: "#132939" }}>
              Skip
            </ButtonText>
          </Button>
        </View>

        {/* Scrollable Main Content */}
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
            paddingTop: svgHeight + 10,
            paddingBottom: 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Carousel */}
          <Carousel
            ref={ref}
            width={width}
            height={carouselHeight}
            data={pages}
            onProgressChange={progress}
            autoPlay
            autoPlayInterval={3500}
            renderItem={({ item }) => (
              <View className="border2" style={{ flex: 1, alignItems: "center", paddingHorizontal: 20 }}>
                <Image
                  source={item.image}
                  className="border2 w-full"
                  style={{
                    width: "100%",
                    height: imageHeight,
                    borderRadius: 24,
                    marginBottom: 16,
                  }}
                  resizeMode="contain"
                />

                <Text
                  style={{
                    fontSize: scaleFont(22, width),
                    color: "#000",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  {item.title}
                </Text>

                <Text
                  style={{
                    fontSize: scaleFont(15, width),
                    color: "#4A4A4A",
                    textAlign: "center",
                    marginBottom: 10,
                  }}
                >
                  {item.subtitle}
                </Text>
              </View>
            )}
          />

          {/* Pagination */}
          <View style={{ alignItems: "center", marginVertical: 16 }}>
            <Pagination.Basic
              progress={progress}
              data={pages}
              dotStyle={{ width: 27, height: 5, borderRadius: 5, backgroundColor: "#D7EFF6" }}
              activeDotStyle={{ width: 27, height: 5, borderRadius: 5, backgroundColor: "#132939" }}
              containerStyle={{ gap: 6 }}
              onPress={(index) => ref.current?.scrollTo({ count: index - progress.value, animated: true })}
            />
          </View>

          {/* Buttons */}
          <View style={{ paddingHorizontal: 20 }}>
            <Button
              size="xl"
              style={{ backgroundColor: "#132939", height: 52, borderRadius: 52, marginBottom: 12 }}
              onPress={handleCreateAccount}
            >
              <ButtonText style={{ fontSize: scaleFont(16, width), color: "#fff" }}>Create Account</ButtonText>
            </Button>
            <Button
              size="xl"
              style={{ backgroundColor: "#F4F5F8", height: 52, borderRadius: 52 }}
              onPress={handleAlreadyHaveAccount}
            >
              <ButtonText style={{ fontSize: scaleFont(16, width), color: "#132939" }}>
                Already have Account
              </ButtonText>
            </Button>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
