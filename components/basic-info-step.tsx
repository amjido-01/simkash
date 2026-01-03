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
import { Icon } from "@/components/ui/icon";
import { Input, InputField, InputIcon } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { GENDER } from "@/constants/menu";
import { useGetCountries } from "@/hooks/use-get-countries";
import { ProfileFormData, StepProps } from "@/types";
import { yupResolver } from "@hookform/resolvers/yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { AlertCircleIcon, CalendarIcon, Loader2 } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";
import CountrySelector from "./country-selector";
import GenderSelector from "./gender-selector";
import { StepIndicator } from "./step-indicator";
import PhoneCodeSelector from "./phone-code-selector";

// Validation schema
const profileSchema = yup.object({
  fullName: yup
    .string()
    .required("Full name is required")
    .min(2, "Full name must be at least 2 characters"),
  phoneCode: yup.string().required("Country code is required"),
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]{7,15}$/, "Please enter a valid phone number"),
  gender: yup
    .string()
    .required("Gender is required")
    .oneOf(["male", "female", "other"], "Please select a valid gender"),
  dateOfBirth: yup
    .string()
    .required("Date of birth is required")
    .matches(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in DD/MM/YYYY format"),
  country: yup.string().required("Country is required"),
});

interface ProfileFormDataWithPhoneCode extends ProfileFormData {
  phoneCode: string;
}

export function BasicInfo({
  onNext,
  initialData,
}: StepProps<ProfileFormDataWithPhoneCode>) {
  console.log("🟢 BasicInfo - Component Mounted");
  console.log("🟢 BasicInfo - Props:", {
    hasOnNext: !!onNext,
    initialData: JSON.stringify(initialData),
  });
  const { height } = useWindowDimensions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    countriesForPicker,
    countryCodesForPicker,
    isLoading: countriesLoading,
    isError: countriesError,
    refetch: refetchCountries,
  } = useGetCountries();

  console.log("🟢 BasicInfo - Countries loaded:", {
    countriesCount: countriesForPicker?.length || 0,
    codesCount: countryCodesForPicker?.length || 0,
    loading: countriesLoading,
    error: countriesError,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfileFormDataWithPhoneCode>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      phoneCode:
        (initialData as ProfileFormDataWithPhoneCode)?.phoneCode || "234",
      phoneNumber: initialData?.phoneNumber?.replace(/^\+\d+/, "") || "", // ✅ Remove code from number
      gender: initialData?.gender || "",
      dateOfBirth: initialData?.dateOfBirth || "",
      country: initialData?.country || "",
    },
    mode: "onChange",
  });

  // Update the onSubmit function to format phone correctly
  const onSubmit = (data: ProfileFormDataWithPhoneCode) => {
    console.log("✅ BasicInfo - Form submitted:", JSON.stringify(data));

    try {
      if (onNext) {
        // ✅ Format phone with country code for API
          let cleanNumber = data.phoneNumber.replace(/^0+/, ''); 
        const formattedData = {
        ...data,
        phoneNumber: `+${data.phoneCode}${cleanNumber}`, // Format: +2348038172350
      };

        console.log(
          "✅ BasicInfo - Calling onNext with formatted data:",
          formattedData
        );
        onNext(formattedData as any); // Cast to bypass type checking
      } else {
        console.error("BasicInfo - onNext is undefined!");
      }
    } catch (error) {
      console.error("BasicInfo - Error calling onNext:", error);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = format(selectedDate, "dd/MM/yyyy");
      setValue("dateOfBirth", formattedDate, { shouldValidate: true });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Box className="flex-1 bg-white">
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                paddingHorizontal: 24,
                paddingBottom: 24,
                minHeight: height - 100,
              }}
              keyboardShouldPersistTaps="handled"
              bounces={false}
              showsVerticalScrollIndicator={false}
            >
              {/* Title */}
              <VStack space="sm" className="mt20">
                <Text className="text-[#303237] font-medium text-[14px] leading-[100%]">
                  Profile Setup
                </Text>
                <Heading className="text-[18px] font-manropesemibold leading-[28px]">
                  Basic Information
                </Heading>
              </VStack>

              <StepIndicator currentStep={1} totalSteps={3} />

              <VStack space="xl" className="flex-1 mt-6">
                {/* Full Name */}
                <FormControl isInvalid={Boolean(errors.fullName)}>
                  <FormControlLabel>
                    <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                      Full Name
                    </FormControlLabelText>
                  </FormControlLabel>

                  <Controller
                    control={control}
                    name="fullName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        variant="outline"
                        size="xl"
                        className={`w-full p-2 rounded-[99px] focus:border-2 focus:border-[#D0D5DD] min-h-[48px] ${
                          errors.fullName
                            ? "border-2 border-red-500"
                            : "border border-[#D0D5DD]"
                        }`}
                      >
                        <InputField
                          placeholder="Enter your full name"
                          className="w-full text-[14px] text-[#303237] min-h-[48px]"
                          placeholderTextColor="#717680"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          autoCapitalize="words"
                        />
                      </Input>
                    )}
                  />

                  {errors.fullName && (
                    <FormControlError>
                      <FormControlErrorIcon
                        className="text-red-500"
                        as={AlertCircleIcon}
                      />
                      <FormControlErrorText className="text-red-500 text-[12px]">
                        {errors.fullName?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Phone Number with Country Code */}
                <FormControl isInvalid={Boolean(errors.phoneNumber)}>
                  <FormControlLabel>
                    <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                      Phone Number
                    </FormControlLabelText>
                  </FormControlLabel>

                  <View
                    className={`w-full rounded-[99px] border min-h-[48px] flex-row items-center ${
                      errors.phoneNumber
                        ? "border-2 border-red-500"
                        : "border border-[#D0D5DD]"
                    }`}
                  >
                    <Controller
                      control={control}
                      name="phoneCode"
                      render={({ field: { onChange, value } }) => (
                        <PhoneCodeSelector
                          value={value}
                          onValueChange={onChange}
                          countryCodes={countryCodesForPicker}
                          error={Boolean(errors.phoneNumber)}
                          loading={countriesLoading}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="phoneNumber"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Input
                          variant="outline"
                          className="flex-1 border-0 h-[48px]"
                        >
                          <InputField
                            placeholder="Enter your phone number"
                            className="text-[14px] text-[#303237] h-[48px] px-4"
                            placeholderTextColor="#717680"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            keyboardType="phone-pad"
                            maxLength={15}
                          />
                        </Input>
                      )}
                    />
                  </View>

                  {errors.phoneNumber && (
                    <FormControlError>
                      <FormControlErrorIcon
                        className="text-red-500"
                        as={AlertCircleIcon}
                      />
                      <FormControlErrorText className="text-red-500 text-[12px]">
                        {errors.phoneNumber?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Gender Selection */}
                <FormControl isInvalid={Boolean(errors.gender)}>
                  <FormControlLabel>
                    <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                      Gender
                    </FormControlLabelText>
                  </FormControlLabel>

                  <Controller
                    control={control}
                    name="gender"
                    render={({ field: { onChange, value } }) => (
                      <GenderSelector
                        value={value}
                        onValueChange={onChange}
                        genders={GENDER}
                        placeholder="Select gender"
                        error={Boolean(errors.gender)}
                      />
                    )}
                  />

                  {errors.gender && (
                    <FormControlError>
                      <FormControlErrorIcon
                        className="text-red-500"
                        as={AlertCircleIcon}
                      />
                      <FormControlErrorText className="text-red-500 text-[12px]">
                        {errors.gender?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>
                {/* Date of Birth */}
                <FormControl isInvalid={Boolean(errors.dateOfBirth)}>
                  <FormControlLabel>
                    <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                      Date of Birth
                    </FormControlLabelText>
                  </FormControlLabel>

                  <Controller
                    control={control}
                    name="dateOfBirth"
                    render={({ field: { value } }) => (
                      <>
                        <Pressable onPress={() => setShowDatePicker(true)}>
                          <Input
                            variant="outline"
                            size="xl"
                            pointerEvents="none"
                            className={`w-full p-2 rounded-[99px] focus:border-2 focus:border-[#D0D5DD] h-[48px] ${
                              errors.dateOfBirth
                                ? "border-2 border-red-500"
                                : "border border-[#D0D5DD]"
                            }`}
                          >
                            <InputField
                              placeholder="DD/MM/YYYY"
                              className="w-full text-[14px] text-[#303237] h-[48px]"
                              placeholderTextColor="#717680"
                              value={value}
                              editable={false}
                              pointerEvents="none"
                            />
                            <InputIcon
                              as={CalendarIcon}
                              className="ml-auto mr-3 text-[#717680]"
                              size="sm"
                            />
                          </Input>
                        </Pressable>

                        {showDatePicker && (
                          <DateTimePicker
                            value={
                              value
                                ? new Date(value.split("/").reverse().join("-"))
                                : new Date()
                            }
                            mode="date"
                            display={
                              Platform.OS === "ios" ? "spinner" : "default"
                            }
                            onChange={handleDateChange}
                            maximumDate={new Date()}
                          />
                        )}
                      </>
                    )}
                  />

                  {errors.dateOfBirth && (
                    <FormControlError>
                      <FormControlErrorIcon
                        className="text-red-500"
                        as={AlertCircleIcon}
                      />
                      <FormControlErrorText className="text-red-500 text-[12px]">
                        {errors.dateOfBirth?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                <FormControl isInvalid={Boolean(errors.country)}>
                  <FormControlLabel>
                    <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                      Country
                    </FormControlLabelText>
                  </FormControlLabel>

                  <Controller
                    control={control}
                    name="country"
                    render={({ field: { onChange, value } }) => (
                      <CountrySelector
                        value={value}
                        onValueChange={onChange}
                        countries={countriesForPicker}
                        placeholder="Select your country"
                        error={Boolean(errors.country)}
                        loading={countriesLoading}
                        onRetry={refetchCountries}
                      />
                    )}
                  />

                  {errors.country && (
                    <FormControlError>
                      <FormControlErrorIcon
                        className="text-red-500"
                        as={AlertCircleIcon}
                      />
                      <FormControlErrorText className="text-red-500 text-[12px]">
                        {errors.country?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Spacer to push button to bottom */}
                <Box className="flex-1 min-h-[24px]" />
              </VStack>

              {/* Continue Button */}
              <VStack space="sm" className="mt-auto pt-6">
                {/* {isLoading ? (
                                    <>
                                      <Icon
                                        as={Loader2}
                                        className="text-typography-white mr-2 animate-spin"
                                        size="sm"
                                        stroke="white"
                                      />
                                      <ButtonText className="text-white text-[14px]">
                                        Creating Account...
                                      </ButtonText>
                                    </>
                                  ) : (
                                    <ButtonText className="text-white text-[14px]">
                                      Create Account
                                    </ButtonText>
                                  )} */}
                <Button
                  className="rounded-full bg-[#132939] h-[48px]"
                  size="xl"
                  onPress={handleSubmit(onSubmit)}
                  accessibilityLabel="Continue to next step"
                >
                  {isSubmitting ? (
                    <>
                      <Icon
                        as={Loader2}
                        className="text-typography-white mr-2 animate-spin"
                        size="sm"
                        stroke="white"
                      />
                      <ButtonText className="text-white text-[14px]">
                        Please wait...
                      </ButtonText>
                    </>
                  ) : (
                    <ButtonText className="text-white text-[14px]">
                      Continue
                    </ButtonText>
                  )}
                </Button>
              </VStack>
            </ScrollView>
          </Box>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
