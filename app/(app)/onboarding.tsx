// import { useRouter } from "expo-router";
// import { Image, View, Text, TouchableOpacity } from "react-native";
// import Onboarding from "react-native-onboarding-swiper";
// import { useEffect, useRef, useState } from "react";

// export default function OnboardingScreens() {
//   const router = useRouter();
//    const swiperRef = useRef(null);
//   const [pageIndex, setPageIndex] = useState(0);

//   const handleComplete = () => {
//     router.replace("/(auth)/signin");
//   };

//   const handleSkip = () => {
//     router.replace("/(auth)/signin");
//   };

//   const Dots = ({ selected }) => (
//     <View
//       style={{
//         height: 5,
//         width: 27,
//         borderRadius: 5,
//         backgroundColor: selected ? "#132939" : "#D7EFF6",
//         marginHorizontal: 2,
//       }}
//     />
//   );

//   return (
//     <View style={{ flex: 1, backgroundColor: "#fff" }}>

//       {/* HEADER */}
//       {/* <View
//         style={{
//           paddingTop: 40,
//           paddingBottom: 10,
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         <Image
//           source={require("../../assets/images/splash.png")}
//           style={{ width: 140, height: 40, resizeMode: "contain" }}
//         />
//       </View> */}

//       <Onboarding
//         onDone={handleComplete}
//         onSkip={handleSkip}
//         bottomBarHighlight={false}
//         showDone={false}
//         showNext={false}
//         showSkip={false}
//         DotComponent={Dots}
//         bottomBarColor="#fff"
//         containerStyles={{
//           paddingTop: 10,
//           marginTop: -30,
//         }}
//         titleStyles={{
//           fontSize: 22,
//           fontFamily: "ManropeSemiBold",
//           color: "#000",
//           textAlign: "center",
//           marginTop: -10,
//           paddingHorizontal: 20,
//         }}
//         subTitleStyles={{
//           fontSize: 15,
//           fontFamily: "ManropeMedium",
//           color: "#4A4A4A",
//           textAlign: "center",
//           paddingHorizontal: 26,
//           marginTop: -10,
//           marginBottom: 60
//         }}
//         imageContainerStyles={{
//           marginTop: -40, 
//           marginBottom: -10,
//         }}
        
//          pages={[
//             {
//               backgroundColor: "#fff",
//               image: (
//                 <Image
//                   source={require("../../assets/images/slide1.gif")}
//                   style={{
//                     width: "90%", // Responsive width
//                     height: 350, // Increased height
//                     borderRadius: 24, // Your requested 24px
//                     alignSelf: "center", // Center the image
//                   }}
//                   resizeMode="cover" // Changed to 'cover' for better fill
//                 />
//               ),
//               title: "Manage and Activate Device SIMs Effortlessly",
//               subtitle:
//                 "Stay connected with ease, activate, and manage SIMs for your POS devices in one place.",
//             },
//             {
//               backgroundColor: "#fff",
//               image: (
//                 <Image
//                   source={require("../../assets/images/slide2.gif")}
//                   style={{
//                     width: "90%", // Responsive width
//                     height: 350, // Increased height
//                     borderRadius: 24, // Your requested 24px
//                     alignSelf: "center", // Center the image
//                   }}
//                   resizeMode="cover" // Changed to 'cover' for better fill
//                 />
//               ),
//               title: "Experience Next-Gen Wireless 5G Connectivity",
//               subtitle:
//                 "Enjoy fast, reliable, and secure 5G for all your devices, stream, and work without limits.",
//             },
//             {
//               backgroundColor: "#fff",
//               image: (
//                 <Image
//                   source={require("../../assets/images/slide6.gif")}
//                   style={{
//                     width: "90%", // Responsive width
//                     height: 350, // Increased height
//                     borderRadius: 24, // Your requested 24px
//                     alignSelf: "center", // Center the image
//                   }}
//                   resizeMode="cover" // Changed to 'cover' for better fill
//                 />
//               ),
//               title: "Pay All Your Bills in One Place",
//               subtitle:
//                 "From airtime and data to electricity and TV subscriptions — handle every payment instantly and securely.",
//             },
//             {
//               backgroundColor: "#fff",
//               image: (
//                 <Image
//                   source={require("../../assets/images/slide3.gif")}
//                   style={{
//                     width: "90%", // Responsive width
//                     height: 350, // Increased height
//                     borderRadius: 24, // Your requested 24px
//                     alignSelf: "center", // Center the image
//                   }}
//                   resizeMode="cover" // Changed to 'cover' for better fill
//                 />
//               ),
//               title: "Seamless Transfers & Quick Withdrawals",
//               subtitle:
//                 "Send and receive money effortlessly. Enjoy instant transfers and fast withdrawals — anytime, anywhere, with total security and transparency.",
//             },
//             {
//               backgroundColor: "#fff",
//               image: (
//                 <Image
//                   source={require("../../assets/images/slide4.gif")}
//                   style={{
//                     width: "90%", // Responsive width
//                     height: 350, // Increased height
//                     borderRadius: 24, // Your requested 24px
//                     alignSelf: "center", // Center the image
//                   }}
//                   resizeMode="cover" // Changed to 'cover' for better fill
//                 />
//               ),
//               title: "Buy Now, Pay Later",
//               subtitle:
//                 "Get what you need instantly and spread your payments with ease. Simple, flexible, and built to support your cash flow.",
//             },
//             {
//               backgroundColor: "#fff",
//               image: (
//                 <Image
//                   source={require("../../assets/images/slide5.gif")}
//                   style={{
//                     width: "90%", // Responsive width
//                     height: 350, // Increased height
//                     borderRadius: 24, // Your requested 24px
//                     alignSelf: "center", // Center the image
//                   }}
//                   resizeMode="cover" // Changed to 'cover' for better fill
//                 />
//               ),
//               title: "SIMKASH Pro",
//               subtitle:
//                 "Enjoy commissions and premium perks designed to reward you as a SIMKASH Pro user.",
//             },
//           ]}
          
//       />

//       {/* CUSTOM BUTTONS BELOW SUBTITLE */}
//       <View
//         style={{
//           paddingHorizontal: 20,
//           marginBottom: 40,
//           marginTop: -10,
//         }}
//       >
//         <TouchableOpacity
//           onPress={() => router.replace("/(auth)/signin")}
//           style={{
//             backgroundColor: "#132939",
//             height: 52,
//             borderRadius: 99,
//             justifyContent: "center",
//             alignItems: "center",
//             marginBottom: 15,
//           }}
//         >
//           <Text
//             style={{
//               color: "#fff",
//               fontSize: 16,
//               fontFamily: "ManropeMedium",
//             }}
//           >
//             Create Account
//           </Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           onPress={() => router.replace("/(auth)/signin")}
//           style={{
//             backgroundColor: "#F4F5F8",
//             height: 52,
//             borderRadius: 99,
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           <Text
//             style={{
//               color: "#132939",
//               fontSize: 16,
//               fontFamily: "ManropeMedium",
//             }}
//           >
//             Already have Account
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// }


import { useRouter } from "expo-router";
import { Image, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRef, useEffect, useState, JSX } from "react";
import Onboarding from "react-native-onboarding-swiper";

// Types
interface DotsProps {
  selected: boolean;
}

interface OnboardingPage {
  backgroundColor: string;
  image: JSX.Element;
  title: string;
  subtitle: string;
}

// Constants
const COLORS = {
  primary: "#132939",
  background: "#fff",
  secondary: "#F4F5F8",
  dotActive: "#132939",
  dotInactive: "#D7EFF6",
  textPrimary: "#000",
  textSecondary: "#4A4A4A",
} as const;

const IMAGE_CONFIG = {
  width: "90%",
  height: 350,
  borderRadius: 24,
} as const;

export default function OnboardingScreens() {
  const router = useRouter();
  const swiperRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 6;

  // Auto-advance slides every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentPage < totalPages - 1) {
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);
        
        // Use the flatList ref to scroll
        if (swiperRef.current?.flatList) {
          swiperRef.current.flatList.scrollToIndex({
            index: nextPage,
            animated: true,
          });
        }
      } else {
        // Optional: Auto-navigate to sign in after last slide
        // navigateToSignIn();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentPage]);
  const navigateToSignIn = () => {
    router.replace("/(auth)/signin");
  };

  // Custom dot component with proper typing
  const Dots = ({ selected }: DotsProps) => (
    <View
      style={[
        styles.dot,
        { backgroundColor: selected ? COLORS.dotActive : COLORS.dotInactive },
      ]}
    />
  );

  // Onboarding pages configuration
  const pages: OnboardingPage[] = [
    {
      backgroundColor: COLORS.background,
      image: (
        <Image
          source={require("../../assets/images/slide1.gif")}
          style={styles.image}
          resizeMode="cover"
        />
      ),
      title: "Manage and Activate Device SIMs Effortlessly",
      subtitle:
        "Stay connected with ease, activate, and manage SIMs for your POS devices in one place.",
    },
    {
      backgroundColor: COLORS.background,
      image: (
        <Image
          source={require("../../assets/images/slide2.gif")}
          style={styles.image}
          resizeMode="cover"
        />
      ),
      title: "Experience Next-Gen Wireless 5G Connectivity",
      subtitle:
        "Enjoy fast, reliable, and secure 5G for all your devices, stream, and work without limits.",
    },
    {
      backgroundColor: COLORS.background,
      image: (
        <Image
          source={require("../../assets/images/slide6.gif")}
          style={styles.image}
          resizeMode="cover"
        />
      ),
      title: "Pay All Your Bills in One Place",
      subtitle:
        "From airtime and data to electricity and TV subscriptions — handle every payment instantly and securely.",
    },
    {
      backgroundColor: COLORS.background,
      image: (
        <Image
          source={require("../../assets/images/slide3.gif")}
          style={styles.image}
          resizeMode="cover"
        />
      ),
      title: "Seamless Transfers & Quick Withdrawals",
      subtitle:
        "Send and receive money effortlessly. Enjoy instant transfers and fast withdrawals — anytime, anywhere, with total security and transparency.",
    },
    {
      backgroundColor: COLORS.background,
      image: (
        <Image
          source={require("../../assets/images/slide4.gif")}
          style={styles.image}
          resizeMode="cover"
        />
      ),
      title: "Buy Now, Pay Later",
      subtitle:
        "Get what you need instantly and spread your payments with ease. Simple, flexible, and built to support your cash flow.",
    },
    {
      backgroundColor: COLORS.background,
      image: (
        <Image
          source={require("../../assets/images/slide5.gif")}
          style={styles.image}
          resizeMode="cover"
        />
      ),
      title: "SIMKASH Pro",
      subtitle:
        "Enjoy commissions and premium perks designed to reward you as a SIMKASH Pro user.",
    },
  ];

  return (
    <View style={styles.container}>
      <Onboarding
        ref={swiperRef}
        onDone={navigateToSignIn}
        onSkip={navigateToSignIn}
        bottomBarHighlight={false}
        showDone={false}
        showNext={false}
        showSkip={false}
        DotComponent={Dots}
        bottomBarColor={COLORS.background}
        containerStyles={styles.onboardingContainer}
        titleStyles={styles.title}
        subTitleStyles={styles.subtitle}
        imageContainerStyles={styles.imageContainer}
        pages={pages}
        pageIndexCallback={(index) => setCurrentPage(index)}
      />

      {/* Custom Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={navigateToSignIn}
          style={styles.primaryButton}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={navigateToSignIn}
          style={styles.secondaryButton}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Already have Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  onboardingContainer: {
    paddingTop: 10,
    marginTop: -30,
  },
  title: {
    fontSize: 22,
    fontFamily: "ManropeSemiBold",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginTop: -10,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "ManropeMedium",
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingHorizontal: 26,
    marginTop: -10,
    marginBottom: 60,
  },
  imageContainer: {
    marginTop: -40,
    marginBottom: -10,
  },
  image: {
    width: IMAGE_CONFIG.width,
    height: IMAGE_CONFIG.height,
    borderRadius: IMAGE_CONFIG.borderRadius,
    alignSelf: "center",
  },
  dot: {
    height: 5,
    width: 27,
    borderRadius: 5,
    marginHorizontal: 2,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
    marginTop: -10,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  primaryButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontFamily: "ManropeMedium",
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
    height: 52,
    borderRadius: 99,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontFamily: "ManropeMedium",
  },
});