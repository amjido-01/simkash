import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { Input, InputField, InputIcon } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  Alert,
  RefreshControl,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { router } from "expo-router";
import { PageHeader } from "@/components/page-header";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuthStore } from "@/store/auth-store";
import { useDashboard } from "@/hooks/use-dashboard";
import { GENDER } from "@/constants/menu";
import { ChevronDownIcon, X, CalendarIcon } from "lucide-react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";

// Validation schema
const schema = yup.object().shape({
  fullName: yup.string().required("Full name is required"),
  email: yup
    .string()
    .required("Email is required")
    .email("Enter a valid email"),
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]+$/, "Phone number must contain only digits")
    .length(11, "Phone number must be exactly 11 digits"),
  gender: yup.string().required("Gender is required"),
  dateOfBirth: yup.string().required("Date of birth is required"),
});

type FormData = yup.InferType<typeof schema>;

interface GenderOption {
  label: string;
  value: string;
}

export default function ManageProfile() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    // wallet,
    // parsedTransactions,
    userProfile,
    // isLoading,
    // isFetching,
    refetch,
  } = useDashboard();
  
  const [isEditing, setIsEditing] = useState({
    phoneNumber: false,
    gender: false,
    dateOfBirth: false,
  });
  
  const [profileImage, setProfileImage] = useState(
    userProfile?.profile_picture || ""
  );

  const [refreshing, setRefreshing] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    mode: "onChange",
    defaultValues: {
      fullName: userProfile?.fullname || "",
      email: user?.email || "",
      phoneNumber: user?.phone || "",
      gender: userProfile?.gender || "",
      dateOfBirth: userProfile?.updatedAt || "",
    },
  });

  const handleBack = () => {
    router.back();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleRemovePhoto = () => {
    Alert.alert(
      "Remove Photo",
      "Are you sure you want to remove your profile photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setProfileImage("");
          },
        },
      ]
    );
  };

  const handleChangePhoto = () => {
    Alert.alert("Change Photo", "Photo picker will be implemented here");
  };

  const handleSaveProfile = (data: FormData) => {
    console.log("Saving profile:", data);
    Alert.alert("Success", "Profile updated successfully", [
      {
        text: "OK",
        onPress: () => router.back(),
      },
    ]);
  };

  const toggleEdit = (field: keyof typeof isEditing) => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
    
    // Open gender modal when editing gender
    if (field === "gender" && !isEditing.gender) {
      setShowGenderModal(true);
    }
    
    // Open date picker when editing date of birth
    if (field === "dateOfBirth" && !isEditing.dateOfBirth) {
      setShowDatePicker(true);
    }
  };

  const handleSelectGender = (genderValue: string) => {
    setValue("gender", genderValue, { shouldValidate: true });
    setShowGenderModal(false);
    setIsEditing((prev) => ({ ...prev, gender: false }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = format(selectedDate, "dd/MM/yyyy");
      setValue("dateOfBirth", formattedDate, { shouldValidate: true });
      setIsEditing((prev) => ({ ...prev, dateOfBirth: false }));
    }
  };

  const renderGenderItem = ({ item }: { item: GenderOption }) => {
    const currentGender = watch("gender");
    return (
      <TouchableOpacity
        onPress={() => handleSelectGender(item.value)}
        className={`px-4 py-4 flex-row items-center justify-between border-b border-[#F3F4F6] ${
          currentGender === item.value ? "bg-[#F0FDF4]" : "bg-white"
        }`}
        activeOpacity={0.7}
      >
        <Text
          className={`text-[14px] flex-1 ${
            currentGender === item.value
              ? "font-semibold text-[#059669]"
              : "text-[#000000]"
          }`}
        >
          {item.label}
        </Text>
        {currentGender === item.value && (
          <View className="w-5 h-5 rounded-full bg-[#10B981] items-center justify-center">
            <Text className="text-white text-[12px]">✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Header */}
        <PageHeader
          title="Manage Profile"
          onBack={handleBack}
          showBackButton={true}
        />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          bounces={true}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#132939"
              colors={["#132939"]}
            />
          }
        >
          <Box className="bg-white px-4 pt-6 pb-32 flex-1">
            <VStack space="lg" className="flex-1">
              {/* Profile Image Section */}
              <VStack space="md" className="items-center">
                <View className="relative">
                    <Image
                       source={{
                    uri: "https://api.dicebear.com/7.x/avataaars/png?seed=Yusuf",
                  }}
                      alt="Profile"
                      className="w-24 h-24 rounded-full"
                      resizeMode="cover"
                    />
                    
                </View>

                <HStack space="md" className="items-center">
                  <TouchableOpacity
                    onPress={handleRemovePhoto}
                    className="px-4 py-2 rounded-full border border-[#EF4444]"
                  >
                    <Text className="text-[14px] font-manropesemibold text-[#EF4444]">
                      Remove
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleChangePhoto}
                    className="px-4 py-2 rounded-full border border-[#132939]"
                  >
                    <Text className="text-[14px] font-manropesemibold text-[#132939]">
                      Change Photo
                    </Text>
                  </TouchableOpacity>
                </HStack>
              </VStack>

              {/* Form Fields */}
              <VStack space="xl">
                {/* Full Name */}
                <FormControl>
                  <FormControlLabel>
                    <FormControlLabelText className="text-[16px] text-[#0A0D14] mb-[8px]">
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
                        className="w-full rounded-[99px] border border-[#D0D5DD] min-h-[48px] bg-[#F9FAFB]"
                      >
                        <InputField
                          placeholder="Enter your full name"
                          className="text-[14px] text-[#141316] px-4 py-3"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          editable={false}
                        />
                      </Input>
                    )}
                  />
                </FormControl>

                {/* Email Address */}
                <FormControl>
                  <FormControlLabel>
                    <FormControlLabelText className="text-[16px] text-[#0A0D14] mb-[8px]">
                      Email Address
                    </FormControlLabelText>
                  </FormControlLabel>
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        variant="outline"
                        size="xl"
                        className="w-full rounded-[99px] border border-[#D0D5DD] min-h-[48px] bg-[#F9FAFB]"
                      >
                        <InputField
                          placeholder="Enter your email"
                          className="text-[14px] text-[#6B7280] px-4 py-3"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          editable={false}
                        />
                      </Input>
                    )}
                  />
                </FormControl>

                {/* Phone Number */}
                <FormControl>
                  <HStack className="justify-between items-center mb-[8px]">
                    <FormControlLabelText className="text-[16px] text-[#0A0D14]">
                      Phone Number
                    </FormControlLabelText>
                    <TouchableOpacity
                      onPress={() => toggleEdit("phoneNumber")}
                    >
                      <Text className="text-[14px] font-semibold font-manropesemibold text-[#132939]">
                        {isEditing.phoneNumber ? "Done" : "Edit"}
                      </Text>
                    </TouchableOpacity>
                  </HStack>
                  <Controller
                    control={control}
                    name="phoneNumber"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input
                        variant="outline"
                        size="xl"
                        className="w-full rounded-[99px] border border-[#D0D5DD] min-h-[48px] bg-[#F9FAFB]"
                      >
                        <InputField
                          placeholder="Enter your phone number"
                          className="text-[14px] text-[#141316] px-4 py-3"
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          keyboardType="phone-pad"
                          editable={isEditing.phoneNumber}
                        />
                      </Input>
                    )}
                  />
                </FormControl>

                {/* Gender */}
                <FormControl>
                  <HStack className="justify-between items-center mb-[8px]">
                    <FormControlLabelText className="text-[16px] text-[#0A0D14]">
                      Gender
                    </FormControlLabelText>
                    <TouchableOpacity onPress={() => toggleEdit("gender")}>
                      <Text className="text-[14px] font-semibold font-manropesemibold text-[#132939]">
                        Edit
                      </Text>
                    </TouchableOpacity>
                  </HStack>
                  <Controller
                    control={control}
                    name="gender"
                    render={({ field: { value } }) => {
                      const selectedGender = GENDER.find(
                        (gender) => gender.value === value
                      );
                      return (
                        <TouchableOpacity
                          onPress={() => {
                            setIsEditing((prev) => ({ ...prev, gender: true }));
                            setShowGenderModal(true);
                          }}
                          activeOpacity={0.7}
                          className="w-full rounded-[99px] border border-[#D0D5DD] min-h-[48px] flex-row items-center justify-between px-4 bg-[#F9FAFB]"
                        >
                          <Text
                            className={`text-[14px] flex-1 ${
                              selectedGender ? "text-[#141316]" : "text-[#717680]"
                            }`}
                            numberOfLines={1}
                          >
                            {selectedGender ? selectedGender.label : "Select gender"}
                          </Text>
                          <ChevronDownIcon size={20} color="#717680" />
                        </TouchableOpacity>
                      );
                    }}
                  />
                </FormControl>

                {/* Date of Birth */}
                <FormControl>
                  <HStack className="justify-between items-center mb-[8px]">
                    <FormControlLabelText className="text-[16px] text-[#0A0D14]">
                      Date of Birth
                    </FormControlLabelText>
                    <TouchableOpacity
                      onPress={() => toggleEdit("dateOfBirth")}
                    >
                      <Text className="text-[14px] font-semibold font-manropesemibold text-[#132939]">
                        Edit
                      </Text>
                    </TouchableOpacity>
                  </HStack>
                  <Controller
                    control={control}
                    name="dateOfBirth"
                    render={({ field: { value } }) => (
                      <>
                        <Pressable
                          onPress={() => {
                            setIsEditing((prev) => ({ ...prev, dateOfBirth: true }));
                            setShowDatePicker(true);
                          }}
                        >
                          <Input
                            variant="outline"
                            size="xl"
                            pointerEvents="none"
                            className="w-full rounded-[99px] border border-[#D0D5DD] min-h-[48px] bg-[#F9FAFB]"
                          >
                            <InputField
                              placeholder="DD/MM/YYYY"
                              className="text-[14px] text-[#141316] px-4 py-3"
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
                </FormControl>
              </VStack>
            </VStack>
          </Box>
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white px-4 py-4"
          style={{
            paddingBottom: Math.max(insets.bottom, 16),
            paddingTop: 16,
          }}
        >
          <Button
            className="rounded-full bg-[#132939] h-[48px] w-full"
            size="xl"
            onPress={handleSubmit(handleSaveProfile)}
          >
            <ButtonText className="text-white text-[16px] font-medium leading-[24px]">
              Save Profile
            </ButtonText>
          </Button>
        </View>

        {/* Gender Selection Modal */}
        <Modal
          visible={showGenderModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowGenderModal(false)}
          statusBarTranslucent
        >
          <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
            <View className="flex-1 bg-white">
              {/* Header */}
              <View className="px-4 py-4 border-b border-[#F3F4F6] flex-row items-center justify-between">
                <TouchableOpacity
                  onPress={() => setShowGenderModal(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  className="mr-3"
                >
                  <X size={24} color="#000000" />
                </TouchableOpacity>
                <Text className="text-[18px] font-semibold text-[#000000] flex-1 text-center mr-8">
                  Select Gender
                </Text>
              </View>
              {/* Section Header */}
              <View className="px-4 py-3 bg-[#F9FAFB]">
                <Text className="text-[12px] font-medium text-[#6B7280] uppercase">
                  Select Your Gender
                </Text>
              </View>
              {/* Genders List */}
              <FlatList
                data={GENDER}
                renderItem={renderGenderItem}
                keyExtractor={(item) => item.value}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          </SafeAreaView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}