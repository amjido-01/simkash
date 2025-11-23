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
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputIcon } from "@/components/ui/input";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { yupResolver } from "@hookform/resolvers/yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { router } from "expo-router";
import {
  AlertCircleIcon,
  CalendarIcon,
  ChevronDownIcon,
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
import { SafeAreaView } from "react-native-safe-area-context";
import * as yup from "yup";

// Validation schema
const profileSchema = yup.object({
  fullName: yup.string().required("Full name is required"),
  phoneNumber: yup
    .string()
    .required("Phone number is required"),
    // .matches(
    //   /^\+234[0-9]{10}$/,
    //   "Phone number must be in format +234XXXXXXXXXX"
    // ),
  gender: yup.string().required("Gender is required"),
  dateOfBirth: yup
    .string()
    .required("Date of birth is required")
    .matches(/^\d{2}\/\d{2}\/\d{4}$/, "Date must be in DD/MM/YYYY format"),
  country: yup.string().required("Country is required"),
});

type ProfileFormData = yup.InferType<typeof profileSchema>;

// Step Indicator Component
const StepIndicator = ({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) => {
  return (
    <HStack space="xs" className="mt-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          className={`h-1 flex-1 rounded-full ${
            index < currentStep ? "bg-[#132939]" : "bg-[#E4E7EC]"
          }`}
        />
      ))}
    </HStack>
  );
};

export default function BasicInfo() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { height } = useWindowDimensions();
  const currentStep = 1;
  const totalSteps = 3;

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      gender: "",
      country: "",
      fullName: "",
      phoneNumber: "+234",
      dateOfBirth: "",
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    console.log("Profile data:", data);
    router.push("/(app)/(profile-setup)/set-pin");
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = format(selectedDate, "dd/MM/yyyy");
      setValue("dateOfBirth", formattedDate, { shouldValidate: true });
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#fff" }}
      edges={["top", "bottom"]}
    >
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

                {/* Step Indicator */}
                <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
              </VStack>

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
                        className={`w-full rounded-[99px] focus:border-2 focus:border-[#D0D5DD] h-[48px] ${
                          errors.fullName
                            ? "border-2 border-red-500"
                            : "border border-[#D0D5DD]"
                        }`}
                      >
                        <InputField
                          placeholder="Enter your full name"
                          className="w-full text-[14px] text-[#717680] h-[48px]"
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
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        variant="outline"
                        size="xl"
                        className={`w-full rounded-[99px] focus:border-2 focus:border-[#D0D5DD] h-[48px] ${
                          errors.phoneNumber
                            ? "border-2 border-red-500"
                            : "border border-[#D0D5DD]"
                        }`}
                      >
                        {/* Country Code Dropdown inside Input */}
                        <Select
                          onValueChange={(countryCode) => {
                            const currentNumber = value?.replace(/^\+\d+/, "") || "";
                            onChange(`+${countryCode}${currentNumber}`);
                          }}
                          defaultValue="234"
                        >
                          <SelectTrigger className="w-20 border-0">
                            <SelectInput placeholder="+234" />
                            <SelectIcon as={ChevronDownIcon} className="mr-2" />
                          </SelectTrigger>
                          <SelectPortal>
                            <SelectBackdrop />
                            <SelectContent>
                              <SelectDragIndicatorWrapper>
                                <SelectDragIndicator />
                              </SelectDragIndicatorWrapper>
                              <SelectItem label="+234" value="234" />
                              <SelectItem label="+1" value="1" />
                              <SelectItem label="+44" value="44" />
                            </SelectContent>
                          </SelectPortal>
                        </Select>

                        {/* Phone Number Input */}
                        <InputField
                          placeholder="phone number"
                          className="w-full text-[14px] text-[#717680] h-[48px]"
                          value={value?.replace(/^\+\d+/, "") || ""}
                          onChangeText={(text) => {
                            const countryCodeMatch = value?.match(/^\+\d+/);
                            const countryCode = countryCodeMatch
                              ? countryCodeMatch[0].replace("+", "")
                              : "234";
                            onChange(`+${countryCode}${text}`);
                          }}
                          onBlur={onBlur}
                          keyboardType="phone-pad"
                        />
                      </Input>
                    )}
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

                {/* Gender */}
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
                      <Select onValueChange={onChange} selectedValue={value}>
                        <SelectTrigger
                          variant="outline"
                          size="xl"
                          className={`w-full rounded-[99px] focus:border-2 focus:border-[#D0D5DD] h-[48px] ${
                            errors.gender
                              ? "border-2 border-red-500"
                              : "border border-[#D0D5DD]"
                          }`}
                        >
                          <SelectInput
                            placeholder="Select your gender"
                            className="text-[14px] text-[#717680] flex-1"
                          />
                          <SelectIcon as={ChevronDownIcon} className="ml-auto mr-3" />
                        </SelectTrigger>
                        <SelectPortal>
                          <SelectBackdrop />
                          <SelectContent>
                            <SelectDragIndicatorWrapper>
                              <SelectDragIndicator />
                            </SelectDragIndicatorWrapper>
                            <SelectItem label="Male" value="male" />
                            <SelectItem label="Female" value="female" />
                            <SelectItem label="Other" value="other" />
                          </SelectContent>
                        </SelectPortal>
                      </Select>
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
                            className={`w-full rounded-[99px] focus:border-2 focus:border-[#D0D5DD] h-[48px] ${
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
                            <InputIcon as={CalendarIcon} className="ml-auto mr-3" />
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

                {/* Country */}
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
                      <Select onValueChange={onChange} selectedValue={value}>
                        <SelectTrigger
                          variant="outline"
                          size="xl"
                          className={`w-full rounded-[99px] focus:border-2 focus:border-[#D0D5DD] h-[48px] ${
                            errors.country
                              ? "border-2 border-red-500"
                              : "border border-[#D0D5DD]"
                          }`}
                        >
                          <SelectInput
                            placeholder="Select your country"
                            className="text-[14px] text-[#717680] flex-1"
                          />
                          <SelectIcon as={ChevronDownIcon} className="ml-auto mr-3" />
                        </SelectTrigger>
                        <SelectPortal>
                          <SelectBackdrop />
                          <SelectContent>
                            <SelectDragIndicatorWrapper>
                              <SelectDragIndicator />
                            </SelectDragIndicatorWrapper>
                            <SelectItem label="Nigeria" value="nigeria" />
                            <SelectItem label="United States" value="united states" />
                            <SelectItem label="United Kingdom" value="united kingdom" />
                            <SelectItem label="Canada" value="canada" />
                            <SelectItem label="Ghana" value="ghana" />
                          </SelectContent>
                        </SelectPortal>
                      </Select>
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
    </SafeAreaView>
  );
}