import React, { useRef } from "react";
import { Dimensions, Image, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useSharedValue } from "react-native-reanimated";
import Carousel, {
  ICarouselInstance,
  Pagination,
} from "react-native-reanimated-carousel";
import { Button, ButtonText } from "@/components/ui/button";
import Onboardsvg from "@/assets/images/onboardsvg.svg";

const width = Dimensions.get("window").width;

const pages = [
  {
    // title: "Effortlessly Manage and Activate Device SIMs",
    title: "Effortlessly Manage and Activate",
    subtitle:
      "Stay connected with ease, activate, and manage SIMs for your POS devices in one place.",
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
    title: "Seamless Transfers & Withdrawals",
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

  const ref = useRef<ICarouselInstance>(null);
  const progress = useSharedValue(0);

  const onPressPagination = (index: number) => {
    ref.current?.scrollTo({
      count: index - progress.value,
      animated: true,
    });
  };

  const goToSignIn = () => router.replace("/(auth)/signin");

  return (
    <View className=" flex-1 pt-[108px]">
      <Onboardsvg
        width={"100%"}
        height={"40%"}
        style={{
          position: "absolute",
          top: -50,
        }}
      />

      <Carousel
        ref={ref}
        width={width}
        height={500}
        data={pages}
        onProgressChange={progress}
        autoPlay
        autoPlayInterval={3500}
        renderItem={({ item }) => (
          <View>
            <Image
              source={item.image}
              className="w-[90%] self-center h-[350px] rounded-[24px] mt-[20px]"
            />

            <Text className=" text-[22px] font-manroperegular text-[#000] text-center pt-[20px] mt-[10px]">
              {item.title}
            </Text>
            <Text className=" text-[15px] font-manroperegular text-[#4A4A4A] text-center px-[26px] mt-[6px] mb-[20px]">
              {item.subtitle}
            </Text>
          </View>
        )}
      />

      {/* PAGINATION */}
      <Pagination.Basic
        progress={progress}
        data={pages}
        dotStyle={{
          width: 27,
          height: 5,
          borderRadius: 5,
          backgroundColor: "#D7EFF6",
        }}
        activeDotStyle={{
          width: 27,
          height: 5,
          borderRadius: 5,
          backgroundColor: "#132939",
        }}
        containerStyle={{
          gap: 6,
          marginTop: 16,
          marginBottom: 20,
        }}
        onPress={onPressPagination}
      />

      {/* BUTTONS */}
      <View className="mt-[24px] px-[20px] mb-[40px]">
        <Button
          className="bg-[#132939] h-[52px] rounded-full text-center text-white  mb-[15px] "
          onPress={goToSignIn}
          variant={"link"}
        >
          <ButtonText className="text-white font-manroperegular text-[16px]">
            Create Account
          </ButtonText>
        </Button>
        <Button
          className="bg-[#F4F5F8] h-[52px] rounded-full text-center text-white  mb-[15px] "
          onPress={goToSignIn}
          variant={"link"}
        >
          <ButtonText className="text-[#132939] font-manroperegular text-[16px]">
            Already have Account
          </ButtonText>
        </Button>
      </View>
    </View>
  );
}
