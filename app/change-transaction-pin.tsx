import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";
import React, { useRef, useCallback, useState, useEffect } from "react";
import { useChangePin } from "@/hooks/use-change-pin";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  useWindowDimensions,
  StyleSheet,
  Image,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { PageHeader } from "@/components/page-header";
import { OtpInput } from "react-native-otp-entry";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
} from "@/components/ui/drawer";
import { ApiError } from "@/types";

type PinStep = "current" | "new" | "confirm";

export default function ChangeTransactionPin() {
  const { height } = useWindowDimensions();
  const [currentStep, setCurrentStep] = useState<PinStep>("current");
  const { changePin, isLoading, error: changePinError } = useChangePin();
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showSuccessDrawer, setShowSuccessDrawer] = useState(false);
  const [error, setError] = useState("");

  const handleBack = () => {
    if (currentStep === "current") {
      router.back();
    } else if (currentStep === "new") {
      setCurrentStep("current");
      setNewPin("");
      setError("");
    } else {
      setCurrentStep("new");
      setConfirmPin("");
      setError("");
    }
  };

  const getStepLabel = () => {
    switch (currentStep) {
      case "current":
        return "Current PIN";
      case "new":
        return "New PIN";
      case "confirm":
        return "Confirm PIN";
    }
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case "current":
        return 1;
      case "new":
        return 2;
      case "confirm":
        return 3;
    }
  };

  const handlePinFilled = async (pin: string) => {
    setError("");

    if (currentStep === "current") {
      setCurrentPin(pin);
      setCurrentStep("new");
    } else if (currentStep === "new") {
      setNewPin(pin);
      setCurrentStep("confirm");
    } else if (currentStep === "confirm") {
      if (newPin !== pin) {
        setError("PINs do not match");
        setConfirmPin("");
        return;
      }

      setConfirmPin(pin);

      try {
        const response = await changePin({
          old_pin: currentPin,
          new_pin: newPin,
          confirm_new_pin: pin,
        });

        if (response.responseSuccessful) {
          setShowSuccessDrawer(true);
        } else {
          setError(response.responseMessage || "Failed to change PIN");
          setConfirmPin("");
        }
      } catch (err: any) {
                if (err instanceof ApiError) {
            console.log('Status:', err.status);
            console.log('Message:', err.message);
            console.log('Full payload:', err.data);
          }
        console.error("Error changing PIN:", err);
        setError(
          err?.responseMessage ||
            err?.message ||
            "Failed to change PIN. Please try again."
        );
        setConfirmPin("");
      }
    }
  };

  const handleDone = () => {
    setShowSuccessDrawer(false);
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setCurrentStep("current");
    router.back();
  };

  // Loading Animation Component with Ripple Effect
  const LoadingAnimation = () => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    // Create 3 ripple animations
    const ripple1 = useRef(new Animated.Value(0)).current;
    const ripple2 = useRef(new Animated.Value(0)).current;
    const ripple3 = useRef(new Animated.Value(0)).current;

    const opacity1 = useRef(new Animated.Value(1)).current;
    const opacity2 = useRef(new Animated.Value(1)).current;
    const opacity3 = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      // Pulse animation for logo
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      // Ripple animation 1
      const rippleAnim1 = Animated.loop(
        Animated.parallel([
          Animated.timing(ripple1, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity1, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );

      // Ripple animation 2 (delayed)
      const rippleAnim2 = Animated.loop(
        Animated.sequence([
          Animated.delay(666),
          Animated.parallel([
            Animated.timing(ripple2, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity2, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      // Ripple animation 3 (more delayed)
      const rippleAnim3 = Animated.loop(
        Animated.sequence([
          Animated.delay(1333),
          Animated.parallel([
            Animated.timing(ripple3, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(opacity3, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      pulseAnimation.start();
      rippleAnim1.start();
      rippleAnim2.start();
      rippleAnim3.start();

      return () => {
        pulseAnimation.stop();
        rippleAnim1.stop();
        rippleAnim2.stop();
        rippleAnim3.stop();
      };
    }, []);

    // Interpolate ripple scales
    const rippleScale1 = ripple1.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2.5],
    });

    const rippleScale2 = ripple2.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2.5],
    });

    const rippleScale3 = ripple3.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2.5],
    });

    return (
      <View style={styles.loadingContainer}>
        {/* Ripple 1 */}
        <Animated.View
          style={[
            styles.ripple,
            {
              transform: [{ scale: rippleScale1 }],
              opacity: opacity1,
            },
          ]}
        />

        {/* Ripple 2 */}
        <Animated.View
          style={[
            styles.ripple,
            {
              transform: [{ scale: rippleScale2 }],
              opacity: opacity2,
            },
          ]}
        />

        {/* Ripple 3 */}
        <Animated.View
          style={[
            styles.ripple,
            {
              transform: [{ scale: rippleScale3 }],
              opacity: opacity3,
            },
          ]}
        />

        {/* Pulsing logo */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            zIndex: 10,
          }}
        >
          <Image
            source={require("@/assets/images/log.png")} // Update path to your logo
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    );
  };

  return (
        <SafeAreaView className="flex-1 bg-[#fafafa]" edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Box className="flex-1 bg-[#fafafa]">
            <PageHeader
              title="Change PIN"
              onBack={handleBack}
              showBackButton={true}
            />

            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: 24,
                minHeight: height - 100,
              }}
              keyboardShouldPersistTaps="handled"
              bounces={false}
              showsVerticalScrollIndicator={false}
            >
              <VStack space="xl" className="flex-1 mt6">
                <VStack space="xs">

                  <View className="flex-row gap-2 mt4">
                    {[1, 2, 3].map((step) => (
                      <View
                        key={step}
                        className="h-1 flex-1 rounded-full"
                        style={{
                          backgroundColor:
                            step <= getStepNumber() ? "#132939" : "#E5E7EF",
                        }}
                      />
                    ))}
                  </View>
                </VStack>

                <VStack space="md" className="mt-4">
                  <Text className="text-[#414651] text-[14px] font-medium text-center mb-3">
                    {getStepLabel()}
                  </Text>

                  <OtpInput
                    key={currentStep}
                    numberOfDigits={4}
                    autoFocus={true}
                    focusColor="#132939"
                    placeholder="0000"
                    type="numeric"
                    secureTextEntry={true}
                    disabled={isLoading}
                    onTextChange={(text) => {
                      if (error) setError("");
                    }}
                    onFilled={(text) => {
                      if (!isLoading) {
                        handlePinFilled(text);
                      }
                    }}
                    theme={{
                      containerStyle: {
                        width: "auto",
                        alignSelf: "center",
                        marginTop: 4,
                      },
                      pinCodeContainerStyle: {
                        width: 49,
                        height: 49,
                        borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: error ? "#EF4444" : "#D0D5DD",
                        backgroundColor: isLoading ? "#F3F4F6" : "#FFFFFF",
                        marginHorizontal: 6,
                        justifyContent: "center",
                        alignItems: "center",
                      },
                      focusedPinCodeContainerStyle: {
                        borderColor: error ? "#EF4444" : "#132939",
                      },
                      pinCodeTextStyle: {
                        color: "#131416",
                      },
                      filledPinCodeContainerStyle: {
                        borderColor: error ? "#EF4444" : "#132939",
                      },
                    }}
                  />

                  {error && (
                    <Text className="text-red-500 text-[14px] text-center mt-2">
                      {error}
                    </Text>
                  )}
                </VStack>

                <Box className="flex-1 min-h-[24px]" />
              </VStack>
            </ScrollView>
          </Box>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Full Page Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <LoadingAnimation />
        </View>
      )}

      {/* Success Drawer */}
      <Drawer
        className="border-t-0"
        isOpen={showSuccessDrawer}
        size="md"
        anchor="bottom"
        onClose={() => setShowSuccessDrawer(false)}
      >
        <DrawerBackdrop
          style={{
            backgroundColor: "#24242440",
            opacity: 1,
          }}
        />
        <DrawerContent
          className="rounded-t-3xl bg-[#FFFFFF]"
          style={{
            borderTopWidth: 0,
            borderColor: "transparent",
            shadowOpacity: 0,
            elevation: 0,
            paddingBottom: Platform.OS === "ios" ? 20 : 8,
          }}
        >
          <DrawerHeader className="pb-2">
            <DrawerCloseButton />
          </DrawerHeader>
          <DrawerBody className="px6 py-2">
            <VStack space="md" className="items-center">
              {/* Celebration Image/Icon */}
              <View className="relative items-center justify-center mb-2">
                {/* Main celebration icon */}
                <View className="w-20 h-20 bg-[#FEF3C7] rounded-full items-center justify-center">
                  <Text className="text-4xl">🎉</Text>
                </View>
              </View>

              {/* Success Text */}
              <VStack space="xs" className="items-center mt-2">
                <Heading className="text-[20px] leading-[24px] font-bold font-manropesemibold text-center">
                  PIN have been changed Successful!
                </Heading>
                <Text className="text-[#303237] text-[14px] text-center leading-[20px] font-medium px-4 mt-1">
                  All updates have been successfully saved and applied to your
                  account settings.
                </Text>
              </VStack>

              <Button
                className="rounded-full bg-[#132939] mt-10 h-[48px] w-full"
                size="xl"
                onPress={handleDone}
                accessibilityLabel="Done"
              >
                <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
                  Done
                </ButtonText>
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.70)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 200,
    height: 200,
  },
  ripple: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#0d2a3f",
    backgroundColor: "transparent",
  },
  logo: {
    width: 50,
    height: 50,
  },
});
