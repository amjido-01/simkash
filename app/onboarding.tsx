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
import { Image, Text, useWindowDimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";
import { onboardingStorage } from "@/utils/onboardingStorage"; // You'll need to create this utility

const pages = [
  {
    title: "Manage and Activate Device SIMs Effortlessly",
    subtitle: "Stay connected with ease — request, activate, and manage SIMs for your POS or other devices in one seamless platform.",
    image: require("../assets/images/slide1.gif"),
  },
  {
    title: "Experience Next-Gen Wireless 5G Connectivity",
    subtitle: "Enjoy ultra-fast, reliable, and secure 5G internet for your devices. Connect, stream, and work without limits.",
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

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  const handleCreateAccount = async () => {
    try {
      // Mark onboarding as complete for first-time visitors
      await onboardingStorage.markOnboardingComplete();
      router.replace("/(auth)/signup");
    } catch (error) {
      console.error("Error marking onboarding complete:", error);
      router.replace("/(auth)/signup");
    }
  };

  const handleAlreadyHaveAccount = async () => {
    try {
      // Mark onboarding as complete for returning users who might have skipped it before
      await onboardingStorage.markOnboardingComplete();
      router.replace("/(auth)/signin");
    } catch (error) {
      console.error("Error marking onboarding complete:", error);
      router.replace("/(auth)/signin");
    }
  };

  // For returning users who want to skip onboarding
  const handleSkipOnboarding = async () => {
    try {
      await onboardingStorage.markOnboardingComplete();
      router.replace("/(auth)/signin");
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      router.replace("/(auth)/signin");
    }
  };

  // Check if user is a returning user who has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const isComplete = await onboardingStorage.isOnboardingComplete();
        
        // If onboarding is already complete and user somehow reached here,
        // we could optionally redirect them directly to sign-in
        // But for now, we'll just show the onboarding with a skip option
        console.log("Onboarding status:", isComplete ? "Complete" : "First time");
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  // Show loading while checking
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View className="flex-1 justify-center items-center">
          {/* You can add a loading indicator here */}
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate responsive heights based on screen size
  const isSmallDevice = height < 700;
  const carouselHeight = isSmallDevice ? height * 0.55 : height * 0.6;
  const imageHeight = isSmallDevice ? 250 : 300;
  const svgHeight = isSmallDevice ? "35%" : "40%";

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff" }}
      edges={["bottom"]}
    >
      <View className="flex-1">
        {/* Background SVG */}
        <Onboardsvg
          width="100%"
          height={svgHeight}
          style={{
            position: "absolute",
            top: -40,
            left: 0,
            right: 0,
          }}
        />

        {/* Skip button for returning users - positioned at top right */}
        <View className="absolute top-14 right-5 z-10">
          <Button
            variant="link"
            size="sm"
            onPress={handleSkipOnboarding}
          >
            <ButtonText className="text-[#132939] font-manroperegular text-[14px]">
              Skip
            </ButtonText>
          </Button>
        </View>

        {/* Main Content Container */}
        <View className="flex-1 justify-between pt-[80px]">
          {/* Carousel Section */}
          <View>
            <Carousel
              ref={ref}
              width={width}
              height={carouselHeight}
              data={pages}
              onProgressChange={progress}
              autoPlay
              autoPlayInterval={3500}
              renderItem={({ item }) => (
                <View className="flex-1 mt-[50px]">
                  <Image
                    source={item.image}
                    style={{
                      width: width * 0.9,
                      height: imageHeight,
                      alignSelf: "center",
                      borderRadius: 24,
                      marginTop: 20,
                      overflow: "hidden",
                    }}
                    resizeMode="cover"
                  />

                  <Text
                    className="text-[22px] font-manroperegular text-[#000] text-center mt-[35px] px-[20px]"
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                  <Text
                    className="text-[15px] font-manroperegular text-[#4A4A4A] text-center px-[26px] mb-[10px] mt-[6px]"
                    numberOfLines={3}
                  >
                    {item.subtitle}
                  </Text>
                </View>
              )}
            />
          </View>

          {/* PAGINATION */}
          <View className="items-center justify-center">
            <Pagination.Basic
              progress={progress}
              data={pages}
              dotStyle={{
                width: 27,
                height: 5,
                borderRadius: 5,
                backgroundColor: "#D7EFF6",
                marginTop: 20,
              }}
              activeDotStyle={{
                width: 27,
                height: 5,
                borderRadius: 5,
                backgroundColor: "#132939",
              }}
              containerStyle={{
                gap: 6,
                marginVertical: isSmallDevice ? 16 : 20,
              }}
              onPress={onPressPagination}
            />
          </View>

          {/* BUTTONS - Fixed at bottom */}
          <View className="px-[20px] pb-[20px]">
            <Button
              size="xl"
              className="bg-[#132939] h-[52px] rounded-full mb-[12px]"
              onPress={handleCreateAccount}
            >
              <ButtonText className="text-white font-manroperegular text-[16px]">
                Create Account
              </ButtonText>
            </Button>
            <Button
              size="xl"
              className="bg-[#F4F5F8] h-[52px] rounded-full"
              onPress={handleAlreadyHaveAccount}
            >
              <ButtonText className="text-[#132939] font-manroperegular text-[16px]">
                Already have Account
              </ButtonText>
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}