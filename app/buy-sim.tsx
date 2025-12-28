import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
} from "@/components/ui/drawer";
import { Heading } from "@/components/ui/heading";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  AlertCircleIcon,
  ChevronDownIcon,
  Gift,
  Wallet,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as yup from "yup";
import { router } from "expo-router";
import { PinDrawer } from "@/components/pin-drawer";
import { ConfirmationDrawer } from "@/components/confirmation-drawer";
import { PageHeader } from "@/components/page-header";
import { useDashboard } from "@/hooks/use-dashboard";

// Nigerian states
const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

// Sample LGAs - you can make this dynamic based on selected state
const SAMPLE_LGAS = [
  "Abaji",
  "Abuja Municipal",
  "Bwari",
  "Gwagwalada",
  "Kuje",
  "Kwali",
];

// Validation schema
const schema = yup.object().shape({
  country: yup.string().required("Please select a country"),
  state: yup.string().required("Please select a state"),
  lga: yup.string().required("Please select a local government area"),
});

type FormData = yup.InferType<typeof schema>;

export default function BuySIM() {
  const insets = useSafeAreaInsets();
  const { wallet } = useDashboard();
  
  const [showCountryDrawer, setShowCountryDrawer] = useState(false);
  const [showStateDrawer, setShowStateDrawer] = useState(false);
  const [showLGADrawer, setShowLGADrawer] = useState(false);
  const [showConfirmationDrawer, setShowConfirmationDrawer] = useState(false);
  const [showPinDrawer, setShowPinDrawer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const SIM_PRICE = 8500;
  const CASHBACK = 500;

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    mode: "onChange",
    defaultValues: {
      country: "",
      state: "",
      lga: "",
    },
  });

  const countryValue = watch("country");
  const stateValue = watch("state");
  const lgaValue = watch("lga");

  const handleCountrySelect = useCallback(
    (country: string) => {
      setValue("country", country);
      setValue("state", ""); // Reset state when country changes
      setValue("lga", ""); // Reset LGA when country changes
    },
    [setValue]
  );

  const handleStateSelect = useCallback(
    (state: string) => {
      setValue("state", state);
      setValue("lga", ""); // Reset LGA when state changes
    },
    [setValue]
  );

  const handleLGASelect = useCallback(
    (lga: string) => {
      setValue("lga", lga);
    },
    [setValue]
  );

  const handleContinue = useCallback(async () => {
    const valid = await trigger();
    if (!valid) return;

    handleSubmit(() => {
      setShowConfirmationDrawer(true);
    })();
  }, [trigger, handleSubmit]);

  const handleContinueToPin = useCallback(() => {
    setShowConfirmationDrawer(false);
    setTimeout(() => {
      setShowPinDrawer(true);
    }, 300);
  }, []);

  const handlePinSubmit = useCallback(
    async (pin: string) => {
      setIsSubmitting(true);

      try {
        console.log("🔐 PIN entered, processing SIM request...");

        // API call will go here
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setShowPinDrawer(false);
        reset();

        // Generate random request ID
        const requestId = `${Math.floor(Math.random() * 90000000000) + 10000000000}`;

        router.push({
          pathname: "/transaction-success",
          params: {
            requestId,
            amount: SIM_PRICE.toString(),
            country: countryValue,
            state: stateValue,
            lga: lgaValue,
          },
        });
      } catch (error: any) {
        throw new Error("Request failed. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [countryValue, stateValue, lgaValue, reset]
  );

  const handleBack = useCallback(() => {
    if (countryValue || stateValue || lgaValue) {
      Alert.alert(
        "Discard Changes?",
        "Are you sure you want to go back? All entered information will be lost.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  }, [countryValue, stateValue, lgaValue]);

  const formatCurrency = (value: number) => {
    return `₦${value.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <PageHeader
          title="Buy SIM"
          onBack={handleBack}
          showBackButton={true}
        />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <Box className="bg-white px-4 pt-6 pb-24 flex-1">
            <VStack space="lg" className="flex-1">
              {/* Country Selection */}
              <FormControl isInvalid={Boolean(errors.country)}>
                <FormControlLabel>
                  <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                    Country
                  </FormControlLabelText>
                </FormControlLabel>

                <Controller
                  control={control}
                  name="country"
                  render={({ field: { value } }) => (
                    <TouchableOpacity
                      onPress={() => setShowCountryDrawer(true)}
                      className={`w-full rounded-[99px] border min-h-[48px] flex-row items-center justify-between px-4 ${
                        errors.country
                          ? "border-2 border-red-500"
                          : "border border-[#D0D5DD]"
                      }`}
                    >
                      <Text
                        className={`text-[14px] ${
                          value ? "text-[#132939]" : "text-[#717680]"
                        }`}
                      >
                        {value || "Choose Country"}
                      </Text>
                      <ChevronDownIcon size={20} color="#6B7280" />
                    </TouchableOpacity>
                  )}
                />

                {errors.country && (
                  <FormControlError>
                    <FormControlErrorIcon
                      className="text-red-500"
                      as={AlertCircleIcon}
                    />
                    <FormControlErrorText className="text-red-500">
                      {errors.country?.message}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* State Selection */}
              <FormControl
                isInvalid={Boolean(errors.state)}
                isDisabled={!countryValue}
              >
                <FormControlLabel>
                  <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                    State
                  </FormControlLabelText>
                </FormControlLabel>

                <Controller
                  control={control}
                  name="state"
                  render={({ field: { value } }) => (
                    <TouchableOpacity
                      onPress={() => countryValue && setShowStateDrawer(true)}
                      disabled={!countryValue}
                      className={`w-full rounded-[99px] border min-h-[48px] flex-row items-center justify-between px-4 ${
                        errors.state
                          ? "border-2 border-red-500"
                          : "border border-[#D0D5DD]"
                      } ${!countryValue ? "opacity-50" : ""}`}
                    >
                      <Text
                        className={`text-[14px] ${
                          value ? "text-[#132939]" : "text-[#717680]"
                        }`}
                      >
                        {value || "Choose State"}
                      </Text>
                      <ChevronDownIcon size={20} color="#6B7280" />
                    </TouchableOpacity>
                  )}
                />

                {errors.state && (
                  <FormControlError>
                    <FormControlErrorIcon
                      className="text-red-500"
                      as={AlertCircleIcon}
                    />
                    <FormControlErrorText className="text-red-500">
                      {errors.state?.message}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* LGA Selection */}
              <FormControl
                isInvalid={Boolean(errors.lga)}
                isDisabled={!stateValue}
              >
                <FormControlLabel>
                  <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                    Local Government Area (LGA)
                  </FormControlLabelText>
                </FormControlLabel>

                <Controller
                  control={control}
                  name="lga"
                  render={({ field: { value } }) => (
                    <TouchableOpacity
                      onPress={() => stateValue && setShowLGADrawer(true)}
                      disabled={!stateValue}
                      className={`w-full rounded-[99px] border min-h-[48px] flex-row items-center justify-between px-4 ${
                        errors.lga
                          ? "border-2 border-red-500"
                          : "border border-[#D0D5DD]"
                      } ${!stateValue ? "opacity-50" : ""}`}
                    >
                      <Text
                        className={`text-[14px] ${
                          value ? "text-[#132939]" : "text-[#717680]"
                        }`}
                      >
                        {value || "Choose LGA"}
                      </Text>
                      <ChevronDownIcon size={20} color="#6B7280" />
                    </TouchableOpacity>
                  )}
                />

                {errors.lga && (
                  <FormControlError>
                    <FormControlErrorIcon
                      className="text-red-500"
                      as={AlertCircleIcon}
                    />
                    <FormControlErrorText className="text-red-500">
                      {errors.lga?.message}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>
            </VStack>
          </Box>
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white px-4 py-4"
          style={{
            paddingBottom: Math.max(insets.bottom, 16),
            paddingTop: 16,
            zIndex: 1,
          }}
        >
          <Button
            className="rounded-full bg-[#132939] h-[48px] w-full"
            size="xl"
            onPress={handleContinue}
          >
            <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
              Continue
            </ButtonText>
          </Button>
        </View>
      </KeyboardAvoidingView>

      {/* Country Drawer */}
      <SelectionDrawer
        isOpen={showCountryDrawer}
        onClose={() => setShowCountryDrawer(false)}
        title="Select Country"
        items={["Nigeria"]}
        selectedItem={countryValue}
        onSelectItem={(item) => {
          handleCountrySelect(item);
          setShowCountryDrawer(false);
        }}
      />

      {/* State Drawer */}
      <SelectionDrawer
        isOpen={showStateDrawer}
        onClose={() => setShowStateDrawer(false)}
        title="Select State"
        items={NIGERIAN_STATES}
        selectedItem={stateValue}
        onSelectItem={(item) => {
          handleStateSelect(item);
          setShowStateDrawer(false);
        }}
      />

      {/* LGA Drawer */}
      <SelectionDrawer
        isOpen={showLGADrawer}
        onClose={() => setShowLGADrawer(false)}
        title="Select LGA"
        items={SAMPLE_LGAS}
        selectedItem={lgaValue}
        onSelectItem={(item) => {
          handleLGASelect(item);
          setShowLGADrawer(false);
        }}
      />

      {/* Confirmation Drawer */}
      <ConfirmationDrawer
        isOpen={showConfirmationDrawer}
        onClose={() => setShowConfirmationDrawer(false)}
        onConfirm={handleContinueToPin}
        title="Need a SIM to Get Started?"
        subtitle="The SIM comes bundled with a 1-year data plan so you can start using it immediately after activation."
        amount={SIM_PRICE.toString()}
        sections={[
          {
            containerClassName:
              "rounded-[20px] border-[#E5E7EF] border px-4 py-2",
            details: [
              { label: "Phone Number", value: "07083175021" },
              { label: "Network Provider", value: "MTN" },
              { label: "Activated On", value: "2nd December, 2025" },
              { label: "Expiry Date", value: "2nd December, 2026" },
              { label: "Data Plan", value: "Unlimited" },
            ],
          },
          {
            containerClassName: "p-4",
            details: [
              {
                label: "Wallet Balance",
                value: formatCurrency(wallet?.balance || 50000),
                icon: <Wallet size={16} color="#FF8D28" />,
              },
              {
                label: "Cashback",
                value: `+₦${CASHBACK}`,
                icon: <Gift size={16} color="#CB30E0" />,
                valueClassName:
                  "text-[12px] font-medium leading-[100%] font-manropesemibold text-[#10B981]",
              },
            ],
          },
        ]}
        confirmButtonText="Confirm"
      />

      {/* PIN Drawer */}
      <PinDrawer
        isOpen={showPinDrawer}
        onClose={() => setShowPinDrawer(false)}
        onSubmit={handlePinSubmit}
        title="Enter PIN"
        isSubmitting={isSubmitting}
        loadingText="Processing request..."
      />
    </SafeAreaView>
  );
}

// Selection Drawer Component
interface SelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: string[];
  selectedItem: string;
  onSelectItem: (item: string) => void;
}

function SelectionDrawer({
  isOpen,
  onClose,
  title,
  items,
  selectedItem,
  onSelectItem,
}: SelectionDrawerProps) {
  const insets = useSafeAreaInsets();

  return (
    <Drawer
      className="border-t-0"
      isOpen={isOpen}
      size="lg"
      anchor="bottom"
      onClose={onClose}
    >
      <DrawerBackdrop
        style={{
          backgroundColor: "#24242440",
          opacity: 1,
        }}
      />
      <DrawerContent
        className="rounded-t-[30px] pt-[28px] bg-[#FFFFFF]"
        style={{
          borderTopWidth: 0,
          borderColor: "transparent",
          shadowOpacity: 0,
          elevation: 0,
          paddingBottom: insets.bottom || 16,
        }}
      >
        <DrawerHeader className="border-b-0 pb-4 px-6">
          <Heading className="font-manropesemibold text-center text-[18px] text-[#000000]">
            {title}
          </Heading>
          <DrawerCloseButton />
        </DrawerHeader>

        <DrawerBody className="pt-0 px-4">
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 400 }}
          >
            <VStack space="xs">
              {items.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => onSelectItem(item)}
                  className={`py-4 px-4 rounded-[12px] ${
                    selectedItem === item ? "bg-[#F3F4F6]" : ""
                  }`}
                >
                  <Text
                    className={`text-[14px] ${
                      selectedItem === item
                        ? "font-manropesemibold text-[#132939]"
                        : "font-manroperegular text-[#303237]"
                    }`}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </VStack>
          </ScrollView>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}
