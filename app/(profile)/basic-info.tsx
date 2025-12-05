// app/(onboarding)/basic-info.tsx
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
import { Input, InputField, InputIcon } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { GENDER } from "@/constants/menu";
import { yupResolver } from "@hookform/resolvers/yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { format } from "date-fns";
import {
  AlertCircleIcon,
  CalendarIcon,
  ChevronDownIcon,
  Loader2,
} from "lucide-react-native";
import React, { useState, useRef, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useCountries } from "@/hooks/use-countries";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
  useWindowDimensions,
  ActivityIndicator,
  View,
} from "react-native";
import { Icon } from "@/components/ui/icon";
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";
import { StepIndicator } from "@/components/step-indicator";
import { router, useLocalSearchParams } from "expo-router";

// Validation schema
const profileSchema = yup.object({
  fullName: yup
    .string()
    .required("Full name is required")
    .min(2, "Full name must be at least 2 characters"),
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(/^\+\d{1,4}-\d{7,15}$/, "Please enter a valid phone number"),
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

type ProfileFormData = yup.InferType<typeof profileSchema>;

export default function BasicInfo() {
  const params = useLocalSearchParams();
  const userEmail = params.email as string;

  console.log('🟢 BasicInfo - Email:', userEmail);

  const { height } = useWindowDimensions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const isMountedRef = useRef(true);

  const {
    countriesForPicker,
    countryCodesForPicker,
    loading: countriesLoading,
    error: countriesError,
    refetch: refetchCountries,
  } = useCountries();

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phoneNumber: "+234-",
      gender: "",
      dateOfBirth: "",
      country: "",
    },
    mode: "onBlur", // Changed from onChange to reduce re-renders
    reValidateMode: "onChange",
  });

  const onSubmit = (data: ProfileFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    console.log("✅ BasicInfo - Form submitted:", JSON.stringify(data));

    try {
      // Navigate to PIN setup with all the data
      router.push({
        pathname: "/(profile)/set-pin",
        params: {
          email: userEmail,
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
          country: data.country,
        },
      });
    } catch (error) {
      console.error("🔴 BasicInfo - Navigation error:", error);
    } finally {
      setTimeout(() => {
        if (isMountedRef.current) {
          setIsSubmitting(false);
        }
      }, 1000);
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
              <VStack space="sm" className="mt-20">
                <Text className="text-[#303237] font-medium text-[14px] leading-[100%]">
                  Profile Setup
                </Text>
                <Heading className="text-[18px] font-manropesemibold leading-[28px]">
                  Basic Information
                </Heading>
              </VStack>

              <StepIndicator currentStep={1} totalSteps={2} />

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
                        className={`w-full p-2 rounded-[99px] min-h-[48px] ${
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
                          maxLength={100}
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

                {/* Phone Number */}
                <FormControl isInvalid={Boolean(errors.phoneNumber)}>
                  <FormControlLabel>
                    <FormControlLabelText className="text-[12px] text-[#414651] mb-[6px]">
                      Phone Number
                    </FormControlLabelText>
                  </FormControlLabel>

                  <Controller
                    control={control}
                    name="phoneNumber"
                    render={({ field: { onChange, onBlur, value } }) => {
                      const match = value?.match(/^\+(\d+)-(.*)$/);
                      const currentCallingCode = match ? match[1] : "234";
                      const phoneNumberOnly = match ? match[2] : "";

                      return (
                        <View
                          className={`w-full rounded-[99px] border min-h-[48px] bg-white flex-row items-center overflow-hidden ${
                            errors.phoneNumber
                              ? "border-2 border-red-500"
                              : "border border-[#D0D5DD]"
                          }`}
                        >
                          {/* Country Code Picker */}
                          <View
                            className="flex-row items-center pl-4 relative"
                            style={{ minWidth: 80 }}
                          >
                            <Text className="text-[14px] text-[#303237] font-medium">
                              +{currentCallingCode}
                            </Text>
                            <ChevronDownIcon size={16} color="#717680" className="ml-1" />
                            
                            {!countriesLoading &&
                             Array.isArray(countryCodesForPicker) &&
                             countryCodesForPicker.length > 0 && (
                              <Picker
                                selectedValue={currentCallingCode}
                                onValueChange={(itemValue) => {
                                  if (itemValue && itemValue !== "") {
                                    onChange(`+${itemValue}-${phoneNumberOnly}`);
                                  }
                                }}
                                style={{
                                  height: 48,
                                  width: 90,
                                  position: "absolute",
                                  left: 0,
                                  opacity: 0,
                                }}
                                dropdownIconColor="transparent"
                                mode="dropdown"
                              >
                                {countryCodesForPicker.map((code) => (
                                  <Picker.Item
                                    key={code.callingCode}
                                    label={code.label}
                                    value={code.callingCode}
                                  />
                                ))}
                              </Picker>
                            )}
                          </View>

                          {/* Separator */}
                          <View className="w-[1px] h-6 bg-[#D0D5DD] mx-2" />

                          {/* Phone Number Input */}
                          <Input variant="outline" size="xl" className="flex-1 border-0 rounded-none">
                            <InputField
                              placeholder="Enter phone number"
                              className="text-[14px] text-[#303237]"
                              placeholderTextColor="#717680"
                              value={phoneNumberOnly}
                              onChangeText={(text) => {
                                const cleanedText = text.replace(/[^0-9]/g, "");
                                if (cleanedText.length <= 11) {
                                  onChange(`+${currentCallingCode}-${cleanedText}`);
                                }
                              }}
                              onBlur={onBlur}
                              keyboardType="phone-pad"
                              maxLength={11}
                            />
                          </Input>
                        </View>
                      );
                    }}
                  />

                  {errors.phoneNumber && (
                    <FormControlError>
                      <FormControlErrorIcon className="text-red-500" as={AlertCircleIcon} />
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
                      <View
                        className={`w-full px-2 rounded-[99px] border min-h-[48px] ${
                          errors.gender ? "border-2 border-red-500" : "border border-[#D0D5DD]"
                        }`}
                      >
                        <Picker
                          selectedValue={value}
                          onValueChange={(itemValue) => {
                            if (itemValue !== "") onChange(itemValue);
                          }}
                          style={{
                            height: 48,
                            width: "100%",
                            paddingLeft: Platform.OS === "ios" ? 16 : 12,
                          }}
                          dropdownIconColor="#717680"
                          mode="dropdown"
                        >
                          <Picker.Item label="Select gender" value="" color="#717680" />
                          {GENDER.map((gender) => (
                            <Picker.Item
                              key={gender.value}
                              label={gender.label}
                              value={gender.value}
                            />
                          ))}
                        </Picker>
                      </View>
                    )}
                  />

                  {errors.gender && (
                    <FormControlError>
                      <FormControlErrorIcon className="text-red-500" as={AlertCircleIcon} />
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
                            className={`w-full p-2 rounded-[99px] h-[48px] ${
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
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={handleDateChange}
                            maximumDate={new Date()}
                          />
                        )}
                      </>
                    )}
                  />

                  {errors.dateOfBirth && (
                    <FormControlError>
                      <FormControlErrorIcon className="text-red-500" as={AlertCircleIcon} />
                      <FormControlErrorText className="text-red-500 text-[12px]">
                        {errors.dateOfBirth?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

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
                    render={({ field: { onChange, value } }) => (
                      <View
                        className={`w-full px-2 rounded-[99px] border min-h-[48px] bg-white ${
                          errors.country ? "border-2 border-red-500" : "border border-[#D0D5DD]"
                        }`}
                      >
                        {countriesLoading ? (
                          <View className="flex-row items-center justify-center h-[48px] px-4">
                            <ActivityIndicator size="small" color="#132939" />
                            <Text className="ml-2 text-[14px] text-[#717680]">
                              Loading countries...
                            </Text>
                          </View>
                        ) : countriesError ? (
                          <View className="flex-row items-center justify-between h-[48px] px-4">
                            <Text className="text-[14px] text-red-500">
                              Failed to load countries
                            </Text>
                            <Button size="sm" variant="link" onPress={refetchCountries}>
                              <ButtonText className="text-[#132939] text-[12px]">
                                Retry
                              </ButtonText>
                            </Button>
                          </View>
                        ) : !Array.isArray(countriesForPicker) ||
                          countriesForPicker.length === 0 ? (
                          <View className="flex-row items-center justify-center h-[48px] px-4">
                            <Text className="text-[14px] text-[#717680]">
                              No countries available
                            </Text>
                          </View>
                        ) : (
                          <Picker
                            selectedValue={value}
                            onValueChange={(itemValue) => {
                              if (itemValue !== "") onChange(itemValue);
                            }}
                            style={{
                              height: 48,
                              width: "100%",
                              paddingLeft: Platform.OS === "ios" ? 16 : 12,
                            }}
                            dropdownIconColor="#717680"
                            mode="dropdown"
                          >
                            <Picker.Item
                              label="Select your country"
                              value=""
                              color="#717680"
                            />
                            {countriesForPicker.map((country) => (
                              <Picker.Item
                                key={country.value}
                                label={country.label}
                                value={country.value}
                              />
                            ))}
                          </Picker>
                        )}
                      </View>
                    )}
                  />

                  {errors.country && (
                    <FormControlError>
                      <FormControlErrorIcon className="text-red-500" as={AlertCircleIcon} />
                      <FormControlErrorText className="text-red-500 text-[12px]">
                        {errors.country?.message}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                {/* Spacer */}
                <Box className="flex-1 min-h-[24px]" />
              </VStack>

              {/* Continue Button */}
              <VStack space="sm" className="mt-auto pt-6">
                <Button
                  className="rounded-full bg-[#132939] h-[48px]"
                  size="xl"
                  onPress={handleSubmit(onSubmit)}
                  isDisabled={isSubmitting || !isValid || countriesLoading}
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
                    <ButtonText className="text-white text-[14px]">Continue</ButtonText>
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