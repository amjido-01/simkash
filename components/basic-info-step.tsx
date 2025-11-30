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
import { ProfileFormData, StepProps } from "@/types";
import { COUNTRIES, COUNTRY_CODES } from "@/utils/mock";
import { yupResolver } from "@hookform/resolvers/yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { format } from "date-fns";
import {
  AlertCircleIcon,
  CalendarIcon
} from "lucide-react-native";
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
import * as yup from "yup";
import { StepIndicator } from "./step-indicator";

// Validation schema
const profileSchema = yup.object({
  fullName: yup.string().required("Full name is required"),
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(/^\+\d{1,4}-\d{7,15}$/, "Please enter a valid phone number"),
  gender: yup.string().required("Gender is required"),
  dateOfBirth: yup
    .string()
    .required("Date of birth is required")
    .matches(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in DD/MM/YYYY format"),
  country: yup.string().required("Country is required"),
});

// Step Indicator Component

export function BasicInfo({ onNext, initialData }: StepProps<ProfileFormData>) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { height } = useWindowDimensions();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      gender: initialData?.gender || "",
      country: initialData?.country || "",
      fullName: initialData?.fullName || "",
      phoneNumber: initialData?.phoneNumber || "+234-",
      dateOfBirth: initialData?.dateOfBirth || "",
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    onNext(data);
    // console.log("Profile data:", data);
    // router.push("/(app)/(profile-setup)/set-pin");
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = format(selectedDate, "dd/MM/yyyy");
      setValue("dateOfBirth", formattedDate, { shouldValidate: true });
    }
  };

  return (
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
              // paddingTop: 64,
              paddingBottom: 24,
              minHeight: height - 100,
            }}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <VStack space="sm" className="mt-8">
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
                        className="w-full text-[14px] text-[#717680] min-h-[48px]"
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
                    <FormControlErrorText className="text-red-500">
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
      // Extract calling code and phone number from the stored value
      const match = value?.match(/^\+(\d+)-(.+)$/);
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
          <View className="flex-row items-center pl-4" style={{ minWidth: 50 }}>
            <Text className="text-[14px] text-[#303237] font-medium">
              +{currentCallingCode}
            </Text>
            <Picker
              selectedValue={currentCallingCode}
              onValueChange={(itemValue) => {
                if (itemValue !== "") {
                  // Store as +callingCode-phoneNumber format
                  onChange(`+${itemValue}-${phoneNumberOnly}`);
                }
              }}
              style={{
                height: 48,
                width: 80,
                position: 'absolute',
                left: 0,
                opacity: 0,
              }}
              dropdownIconColor="transparent"
              mode="dropdown"
            >
              {COUNTRY_CODES.map((code) => (
                <Picker.Item
                  key={code.callingCode}
                  label={code.label}
                  value={code.callingCode}
                  style={{
                    fontSize: 14,
                    color: "#303237",
                  }}
                />
              ))}
            </Picker>
           
          </View>

          {/* Phone Number Input */}
          <Input
            variant="outline"
            size="xl"
            className="flex-1 border-0 rounded-none"
          >
            <InputField
              placeholder="Enter your phone number"
              className="text-[14px] text-[#717680] pl-2"
              value={phoneNumberOnly}
              onChangeText={(text) => {
                // Only allow numbers
                const cleanedText = text.replace(/[^0-9]/g, '');
                onChange(`+${currentCallingCode}-${cleanedText}`);
              }}
              onBlur={onBlur}
              keyboardType="phone-pad"
            />
          </Input>
        </View>
      );
    }}
  />

  {errors.phoneNumber && (
    <FormControlError>
      <FormControlErrorIcon
        className="text-red-500"
        as={AlertCircleIcon}
      />
      <FormControlErrorText className="text-red-500">
        {errors.phoneNumber?.message}
      </FormControlErrorText>
    </FormControlError>
  )}
</FormControl>

              {/* GENDER SELECTION */}
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
                      className={`w-full px-2 rounded-[99px] flex items-center justify-center border min-h-[48px] ${
                        errors.gender
                          ? "border-2 border-red-500"
                          : "border border-[#D0D5DD]"
                      }`}
                    >
                      <Picker
                        selectedValue={value}
                        onValueChange={(itemValue) => {
                          if (itemValue !== "") {
                            onChange(itemValue);
                          }
                        }}
                        style={{
                          height: 48,
                          width: "100%",
                          paddingLeft: Platform.OS === "ios" ? 16 : 12, // Adjust these values
                          paddingRight: 16,
                        }}
                        itemStyle={{
                          fontSize: 12,
                          height: 48,
                          ...(Platform.OS === "ios" && {
                            textAlign: "center",
                          }),
                        }}
                        dropdownIconColor="#717680"
                        mode="dropdown"
                      >
                        <Picker.Item
                          label="Select gender"
                          value=""
                          color="#717680"
                          style={{
                            fontSize: 14,
                          }}
                        />
                        {GENDER.map((gender) => (
                          <Picker.Item
                            key={gender.value}
                            label={gender.label}
                            value={gender.value}
                            style={{
                              fontSize: 14,
                              color: "#414651",
                            }}
                          />
                        ))}
                      </Picker>
                    </View>
                  )}
                />

                {errors.gender && (
                  <FormControlError>
                    <FormControlErrorIcon
                      className="text-red-500"
                      as={AlertCircleIcon}
                    />
                    <FormControlErrorText className="text-red-500">
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
                            className="w-full text-[14px] text-[#717680] h-[48px]"
                            value={value}
                            editable={false}
                            pointerEvents="none"
                          />
                          <InputIcon
                            as={CalendarIcon}
                            className="ml-auto mr-3"
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
                          display="spinner"
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
                    <FormControlErrorText className="text-red-500">
                      {errors.dateOfBirth?.message}
                    </FormControlErrorText>
                  </FormControlError>
                )}
              </FormControl>

              {/* COUNTRY SELECTION */}
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
                        errors.country
                          ? "border-2 border-red-500"
                          : "border border-[#D0D5DD]"
                      }`}
                    >
                      <Picker
                        selectedValue={value}
                        onValueChange={(itemValue) => {
                          if (itemValue !== "") {
                            onChange(itemValue);
                          }
                        }}
                        style={{
                          height: 48,
                          width: "100%",
                          paddingLeft: Platform.OS === "ios" ? 16 : 12, // Adjust these values
                          paddingRight: 16,
                        }}
                        itemStyle={{
                          fontSize: 14,
                          height: 48,
                          ...(Platform.OS === "ios" && {
                            textAlign: "center",
                          }),
                        }}
                        dropdownIconColor="#717680"
                        mode="dropdown"
                      >
                        <Picker.Item
                          label="Select your country"
                          value=""
                          color="#717680"
                          style={{
                            fontSize: 12,
                          }}
                        />
                        {COUNTRIES.map((Country) => (
                          <Picker.Item
                            key={Country.value}
                            label={Country.label}
                            value={Country.value}
                            style={{
                              fontSize: 14,
                              color: "#414651",
                            }}
                          />
                        ))}
                      </Picker>
                    </View>
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

              {/* Spacer to push button to bottom */}
              <Box className="flex-1 min-h-[24px]" />
            </VStack>

            {/* Continue Button */}
            <VStack space="sm" className="mt-auto pt-6">
              <Button
                className="rounded-full bg-[#132939] h-[48px]"
                size="xl"
                onPress={handleSubmit(onSubmit)}
              >
                <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
                  Continue
                </ButtonText>
              </Button>
            </VStack>
          </ScrollView>
        </Box>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
