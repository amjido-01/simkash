import Onboardsvg from "@/assets/images/onboardsvg.svg";
import { Button, ButtonText } from "@/components/ui/button";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { Image, Text, useWindowDimensions, View } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";

const pages = [
  {
    title: "Effortlessly Management",
    subtitle: "Stay connected with ease, activate, and manage SIMs",
    image: require("../../assets/images/slide1.gif"),
  },
  {
    title: "Experience Next-Gen Wireless",
    subtitle: "Enjoy fast, reliable, and secure 5G for all your devices.",
    image: require("../../assets/images/slide2.gif"),
  },
  {
    title: "Pay All Your Bills in One Place",
    subtitle:
      "From airtime and data to electricity and TV subscriptions — handle everything securely.",
    image: require("../../assets/images/slide6.gif"),
  },
  {
    title: "Seamless Transactions",
    subtitle:
      "Send and receive money effortlessly — with total security and transparency.",
    image: require("../../assets/images/slide3.gif"),
  },
  {
    title: "Buy Now, Pay Later",
    subtitle: "Get what you need instantly and spread your payments with ease.",
    image: require("../../assets/images/slide4.gif"),
  },
  {
    title: "SIMKASH Pro",
    subtitle: "Enjoy commissions and premium perks designed to reward you.",
    image: require("../../assets/images/slide5.gif"),
  },
];

export default function OnboardingScreens() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const ref = useRef<ICarouselInstance>(null);
  const progress = useSharedValue(0);

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  const goToSignUp = () => router.replace("/(auth)/signup");
  const goToSignIn = () => router.replace("/(auth)/signin");

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

        {/* Main Content Container */}
        <View className="flex-1 justify-between pt-[80px]">
          {/* Carousel Section */}
          <View style={{ flex: 1 }}>
            <Carousel
              ref={ref}
              width={width}
              height={carouselHeight}
              data={pages}
              onProgressChange={progress}
              autoPlay
              autoPlayInterval={3500}
              renderItem={({ item }) => (
                <View className="flex-1">
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
                    className="text-[22px] font-manroperegular text-[#000] text-center mt-[20px] px-[20px]"
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
                // marginTop: 20,
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
              onPress={goToSignUp}
            >
              <ButtonText className="text-white font-manroperegular text-[16px]">
                Create Account
              </ButtonText>
            </Button>
            <Button
              size="xl"
              className="bg-[#F4F5F8] h-[52px] rounded-full"
              onPress={goToSignIn}
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
