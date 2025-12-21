import React, { useRef, useCallback, useState, useEffect } from "react";
import { ScanFace } from "lucide-react-native";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  Platform,
  TouchableOpacity,
  View,
  Alert,
  Modal,
  StyleSheet,
  Image,
  Animated,
} from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { PIN_LENGTH } from "@/constants/menu";

interface PinDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => Promise<void>;
  title?: string;
  subtitle?: string;
  isSubmitting?: boolean;
  loadingText?: string;
  showForgotPin?: boolean;
  onForgotPin?: () => void;
}

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
          source={require('@/assets/images/log.png')} // Update path to your logo
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};

export const PinDrawer: React.FC<PinDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Enter PIN",
  subtitle,
  isSubmitting = false,
  loadingText = "Processing...",
  showForgotPin = true,
  onForgotPin,
}) => {
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const otpRef = useRef<any>(null);

  const handleNumberPress = useCallback(
    (num: string) => {
      if (pin.length < PIN_LENGTH) {
        const newPin = pin + num;
        setPin(newPin);
        setPinError("");
        
        if (otpRef.current) {
          otpRef.current.setValue(newPin);
        }
        
        if (newPin.length === PIN_LENGTH) {
          setTimeout(() => handlePinSubmit(newPin), 300);
        }
      }
    },
    [pin]
  );

  const handleBackspace = useCallback(() => {
    if (pin.length > 0) {
      const newPin = pin.slice(0, -1);
      setPin(newPin);
      setPinError("");
      if (otpRef.current) {
        otpRef.current.setValue(newPin);
      }
    }
  }, [pin]);

  const handlePinChange = useCallback((text: string) => {
    setPin(text);
    setPinError("");
  }, []);

  const handlePinSubmit = useCallback(
    async (pinToSubmit?: string) => {
      const finalPin = pinToSubmit || pin;
      if (finalPin.length !== PIN_LENGTH) {
        setPinError("Please enter your 4-digit PIN");
        return;
      }

      try {
        await onSubmit(finalPin);
        setPin("");
        setPinError("");
        if (otpRef.current) {
          otpRef.current.clear();
        }
      } catch (error) {
        setPinError(
          error instanceof Error ? error.message : "Invalid PIN. Please try again."
        );
        setPin("");
        if (otpRef.current) {
          otpRef.current.clear();
        }
      }
    },
    [pin, onSubmit]
  );

  const handleForgotPin = useCallback(() => {
    if (onForgotPin) {
      onForgotPin();
    } else {
      Alert.alert(
        "Forgot PIN",
        "Please contact support to reset your PIN.",
        [{ text: "OK" }]
      );
    }
  }, [onForgotPin]);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setPin("");
      setPinError("");
      onClose();
    }
  }, [isSubmitting, onClose]);

  return (
    <>
      <Drawer
        className="border-t-0"
        isOpen={isOpen}
        size="lg"
        anchor="bottom"
        onClose={handleClose}
      >
        <DrawerBackdrop
          style={{
            backgroundColor: "#24242440",
            opacity: 1,
          }}
        />
        <DrawerContent
          className="rounded-t-[30px] pt-[39px] bg-[#FFFFFF]"
          style={{
            borderTopWidth: 0,
            borderColor: "transparent",
            shadowOpacity: 0,
            elevation: 0,
            paddingBottom: Platform.OS === "ios" ? 34 : 16,
          }}
        >
          <DrawerHeader className="border-b-0 pb-6 px-4">
            <VStack className="items-center w-full">
              <Heading className="font-manropesemibold w-full text-center text-[18px] text-[#000000] mb-2">
                {title}
              </Heading>
              {subtitle && (
                <Text className="text-center text-[12px] font-manroperegular text-[#6B7280] px-2">
                  {subtitle}
                </Text>
              )}
            </VStack>
            {!isSubmitting && <DrawerCloseButton />}
          </DrawerHeader>

          <DrawerBody className="pt-2 px-2 pb-8">
            <VStack space="lg" className="items-center">
              <View className="mb-6">
                <OtpInput
                  ref={otpRef}
                  numberOfDigits={PIN_LENGTH}
                  focusColor="transparent"
                  type="numeric"
                  secureTextEntry={true}
                  disabled={isSubmitting}
                  autoFocus={false}
                  onTextChange={handlePinChange}
                  theme={{
                    containerStyle: {
                      width: "auto",
                      alignSelf: "center",
                    },
                    pinCodeContainerStyle: {
                      width: 49,
                      height: 49,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: pinError ? "#EF4444" : "#E5E7EB",
                      backgroundColor: "#FFFFFF",
                      marginHorizontal: 4,
                      justifyContent: "center",
                      alignItems: "center",
                    },
                    focusedPinCodeContainerStyle: {
                      borderColor: pinError ? "#EF4444" : "#132939",
                    },
                    pinCodeTextStyle: {
                      color: "#000000",
                      fontSize: 32,
                      fontWeight: "600",
                    },
                    filledPinCodeContainerStyle: {
                      borderColor: pinError ? "#EF4444" : "#10B981",
                    },
                  }}
                />
              </View>

              {pinError && !isSubmitting && (
                <Text className="text-red-500 text-[12px] font-manroperegular text-center mb-2">
                  {pinError}
                </Text>
              )}

              {!isSubmitting && (
                <View className="w-full max-w-[320px]">
                  <VStack space="lg">
                    {[
                      [1, 2, 3],
                      [4, 5, 6],
                      [7, 8, 9],
                    ].map((row, rowIndex) => (
                      <HStack key={rowIndex} className="justify-between px-4">
                        {row.map((num) => (
                          <TouchableOpacity
                            key={num}
                            onPress={() => handleNumberPress(num.toString())}
                            className="w-[70px] h-[60px] items-center justify-center"
                            activeOpacity={0.6}
                            disabled={pin.length >= PIN_LENGTH}
                          >
                            <Text className="text-[28px] font-manropesemibold text-[#000000]">
                              {num}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </HStack>
                    ))}

                    <HStack className="justify-between px-4">
                      <TouchableOpacity
                        onPress={() => {
                          console.log("Biometric auth");
                        }}
                        className="w-[70px] h-[60px] items-center justify-center"
                        activeOpacity={0.6}
                      >
                        <ScanFace className="text-red-500 h-[24px] w-[24px]" color="#141B34" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleNumberPress("0")}
                        className="w-[70px] h-[60px] items-center justify-center"
                        activeOpacity={0.6}
                        disabled={pin.length >= PIN_LENGTH}
                      >
                        <Text className="text-[28px] font-manropesemibold text-[#000000]">
                          0
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleBackspace}
                        className="w-[70px] h-[60px] items-center justify-center"
                        activeOpacity={0.6}
                        disabled={pin.length === 0}
                      >
                        <Text
                          className={`text-[24px] ${
                            pin.length === 0 ? "opacity-30" : ""
                          }`}
                        >
                          ⌫
                        </Text>
                      </TouchableOpacity>
                    </HStack>
                  </VStack>
                </View>
              )}

              {!isSubmitting && showForgotPin && (
                <TouchableOpacity onPress={handleForgotPin} className="mt-6">
                  <Text className="text-[14px] font-manropesemibold text-[#132939]">
                    Forgot PIN?
                  </Text>
                </TouchableOpacity>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Full Screen Loading Overlay - Ripple Effect */}
      <Modal
        visible={isSubmitting}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.loadingOverlay}>
          <LoadingAnimation />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.70)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 200,
  },
  ripple: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#0d2a3f',
    backgroundColor: 'transparent',
  },
  logo: {
    width: 50,
    height: 50,
  },
});