import { BasicInfo } from '@/components/basic-info-step';
import SetPasscode from '@/components/set-passcode';
import SetPin from '@/components/set-pin';
import { CompleteProfileData, PasscodeFormData, PinFormData, ProfileFormData } from '@/types';
import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';



// Props for step components


const TOTAL_STEPS = 3;

const ProfileSetup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CompleteProfileData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Move to the next step and merge data
  const handleNext = useCallback(
    (stepData: Partial<CompleteProfileData>) => {
      const updatedData = { ...formData, ...stepData };
      setFormData(updatedData);

      if (currentStep < TOTAL_STEPS) {
        setCurrentStep((prev) => prev + 1);
      } else {
        // Last step reached - submit all data
        handleSubmit(updatedData as CompleteProfileData);
      }
    },
    [currentStep, formData]
  );

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleSubmit = async (finalData: CompleteProfileData) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting Complete Profile Data:', {
        profile: {
          fullName: finalData.fullName,
          phoneNumber: finalData.phoneNumber,
          gender: finalData.gender,
          dateOfBirth: finalData.dateOfBirth,
          country: finalData.country,
        },
        security: {
          pin: finalData.newPin, // In production, hash this before sending
          passcode: finalData.newPasscode, // In production, hash this before sending
        },
      });

      // TODO: Replace with actual API call
      // const response = await api.createProfile({
      //   fullName: finalData.fullName,
      //   phoneNumber: finalData.phoneNumber,
      //   gender: finalData.gender,
      //   dateOfBirth: finalData.dateOfBirth,
      //   country: finalData.country,
      //   pin: hashPin(finalData.newPin),
      //   passcode: hashPasscode(finalData.newPasscode),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Success is handled by the SetPasscode component's modal
      console.log('Profile setup completed successfully!');
    } catch (error) {
      console.error('Error submitting profile:', error);
      // Handle error appropriately
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render each setup step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfo
            onNext={(data: ProfileFormData) => handleNext(data)}
            initialData={formData}
          />
        );
      case 2:
        return (
          <SetPin
            onNext={(data: PinFormData) => handleNext(data)}
            onBack={handleBack}
            initialData={formData}
          />
        );
      case 3:
        return (
          <SetPasscode
            onNext={(data: PasscodeFormData) => handleNext(data)}
            onBack={handleBack}
            initialData={formData}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#fff' }}
      edges={['top', 'bottom']}
    >
      {renderStep()}
    </SafeAreaView>
  );
};

export default ProfileSetup;