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
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { yupResolver } from "@hookform/resolvers/yup";
import { Gift, Wallet } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  Alert,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as yup from "yup";
import { router } from "expo-router";
import { ConfirmationDrawer } from "@/components/confirmation-drawer";
import { PageHeader } from "@/components/page-header";
import { useDashboard } from "@/hooks/use-dashboard";
import { useGetCountry } from "@/hooks/use-country";
import { useGetCities } from "@/hooks/use-cities";
import { useGetStates } from "@/hooks/use-states";
import { useSimRequest } from "@/hooks/use-sim-request";
import SearchableSelector from "@/components/searchable-selector";

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

  const [showConfirmationDrawer, setShowConfirmationDrawer] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("");
  const [selectedStateCode, setSelectedStateCode] = useState<string>("");

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

  // Fetch location data
  const { countries, isLoading: isLoadingCountries } = useGetCountry();
  const { states, isLoading: isLoadingStates } =
    useGetStates(selectedCountryCode);
  const { cities: lgas, isLoading: isLoadingLGAs } = useGetCities(stateValue);

  // SIM Request mutation
  const { mutateAsync: requestSim, isPending: isSubmitting } = useSimRequest();

  const handleCountrySelect = useCallback(
    (countryCode: string, countryName: string) => {
      setValue("country", countryName);
      setValue("state", "");
      setValue("lga", "");
      setSelectedCountryCode(countryCode);
      setSelectedStateCode("");
    },
    [setValue]
  );

  const handleStateSelect = useCallback(
    (stateCode: string, stateName: string) => {
      setValue("state", stateName);
      setValue("lga", "");
      setSelectedStateCode(stateCode);
    },
    [setValue]
  );

  const handleLGASelect = useCallback(
    (lgaId: string, lgaName: string) => {
      setValue("lga", lgaName);
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

  const handleConfirmRequest = useCallback(async () => {
    try {

      // Make API call with proper payload format
      const response = await requestSim({
        country: countryValue.toLowerCase(),
        state: stateValue.toLowerCase(),
        lga: lgaValue.toLowerCase(),
      });


      // Response is the agent object, so if we get a response, it's successful
      if (response && response.id) {
        setShowConfirmationDrawer(false);
        reset();

        // Small delay for smooth transition
        await new Promise((resolve) => setTimeout(resolve, 300));

        router.push({
          pathname: "/sim-request-success",
          params: {
            requestId: response.id.toString(),
            status: response.status,
            amount: SIM_PRICE.toString(),

            // Agent info
            partnerName: response.fullname,
            partnerPhone: response.phone,
            partnerRole: response.role,

            // Location
            country: response.country,
            state: response.state,
            lga: response.lga,
          },
        });
      } else {
        throw new Error("Request failed. Please try again.");
      }
    } catch (error: any) {
      console.error("SIM Request Error:", error);
      Alert.alert(
        "Request Failed",
        error?.message ||
          error?.responseMessage ||
          "Unable to process your request. Please try again."
      );
    }
  }, [countryValue, stateValue, lgaValue, requestSim, reset]);

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

  const formatCurrency = (value?: number | string) => {
    if (!value) return "₦0.00";
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return "₦0.00";
    return `₦${numValue.toLocaleString("en-NG", {
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
        <PageHeader title="Buy SIM" onBack={handleBack} showBackButton={true} />

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
                    <SearchableSelector
                      value={selectedCountryCode}
                      onValueChange={handleCountrySelect}
                      items={countries.map((c) => ({
                        id: c.isoCode,
                        name: c.name,
                      }))}
                      placeholder="Choose Country"
                      title="Select Country"
                      error={Boolean(errors.country)}
                      isLoading={isLoadingCountries}
                      searchPlaceholder="Search countries..."
                    />
                  )}
                />

                {errors.country && (
                  <FormControlError>
                    <FormControlErrorIcon className="text-red-500" />
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
                    <SearchableSelector
                      value={selectedStateCode}
                      onValueChange={handleStateSelect}
                      items={states.map((s) => ({
                        id: s.isoCode,
                        name: s.name,
                      }))}
                      placeholder="Choose State"
                      title="Select State"
                      error={Boolean(errors.state)}
                      isLoading={isLoadingStates}
                      disabled={!countryValue}
                      searchPlaceholder="Search states..."
                    />
                  )}
                />

                {errors.state && (
                  <FormControlError>
                    <FormControlErrorIcon className="text-red-500" />
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
                    <SearchableSelector
                      value={lgaValue}
                      onValueChange={handleLGASelect}
                      items={lgas.map((c) => ({
                        id: c.name,
                        name: c.name,
                      }))}
                      placeholder="Choose LGA"
                      title="Select LGA"
                      error={Boolean(errors.lga)}
                      isLoading={isLoadingLGAs}
                      disabled={!stateValue}
                      searchPlaceholder="Search LGAs..."
                    />
                  )}
                />

                {errors.lga && (
                  <FormControlError>
                    <FormControlErrorIcon className="text-red-500" />
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
            disabled={isSubmitting}
          >
            <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
              {isSubmitting ? "Processing..." : "Continue"}
            </ButtonText>
          </Button>
        </View>
      </KeyboardAvoidingView>

      {/* Confirmation Drawer */}
      <ConfirmationDrawer
        isOpen={showConfirmationDrawer}
        onClose={() => setShowConfirmationDrawer(false)}
        onConfirm={handleConfirmRequest}
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
                value: formatCurrency(wallet?.balance),
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
        confirmButtonText="Confirm Request"
      />
    </SafeAreaView>
  );
}
