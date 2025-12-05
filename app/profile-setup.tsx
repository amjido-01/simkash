// app/(onboarding)/profile-setup.tsx
import { BasicInfo } from '@/components/basic-info-step';
import SetPin from '@/components/set-pin';
import { CompleteProfileData, PinFormData, ProfileFormData } from '@/types';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { AppState } from 'react-native';
import { ErrorBoundary } from '@/components/error-boundary';

const TOTAL_STEPS = 2;

const ProfileSetup = () => {
  const params = useLocalSearchParams();
  const userEmail = params.email as string;
  
  // ✅ Use ref to prevent stale closures
  const formDataRef = useRef<Partial<CompleteProfileData>>({
    email: userEmail,
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CompleteProfileData>>({
    email: userEmail,
  });
  
  // ✅ Track if component is mounted
  const isMounted = useRef(true);
  
  useEffect(() => {
    console.log('🟢 ProfileSetup - Mounted with email:', userEmail);
    
    return () => {
      isMounted.current = false;
      console.log('🟢 ProfileSetup - Unmounted');
    };
  }, []);
  
  // ✅ Handle app state changes (minimize/restore)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      console.log('🟢 App state changed:', nextAppState);
      
      if (nextAppState === 'active') {
        // App came back to foreground - restore state if needed
        console.log('🟢 App restored, current step:', currentStep);
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [currentStep]);

  // ✅ Memoize with stable dependencies
  const handleNext = useCallback(
    (stepData: Partial<CompleteProfileData>) => {
      if (!isMounted.current) {
        console.log('⚠️ Component unmounted, ignoring handleNext');
        return;
      }
      
      // Update ref immediately
      formDataRef.current = { 
        ...formDataRef.current, 
        ...stepData,
        email: userEmail,
      };
      
      console.log('🟢 Form data updated:', JSON.stringify(formDataRef.current));
      
      // Update state after ref
      setFormData(formDataRef.current);
      
      if (currentStep < TOTAL_STEPS) {
        console.log('🟢 Moving to step:', currentStep + 1);
        setCurrentStep((prev) => prev + 1);
      }
    },
    [currentStep, userEmail] // ✅ Removed formData dependency
  );

  const handleBack = useCallback(() => {
    if (!isMounted.current) {
      console.log('⚠️ Component unmounted, ignoring handleBack');
      return;
    }
    
    console.log('🟢 Going back from step:', currentStep);
    
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  // ✅ Memoize step rendering to prevent unnecessary re-renders
  const renderStep = useCallback(() => {
    console.log('🟢 Rendering step:', currentStep);
    
    switch (currentStep) {
      case 1:
        return (
          <BasicInfo
            key="basic-info" // ✅ Add key for proper React reconciliation
            onNext={handleNext}
            initialData={formDataRef.current as ProfileFormData}
          />
        );
      case 2:
        return (
          <SetPin
            key="set-pin" // ✅ Add key for proper React reconciliation
            onNext={handleNext}
            onBack={handleBack}
            initialData={formDataRef.current as any}
          />
        );
      default:
        console.log('🔴 Invalid step:', currentStep);
        return null;
    }
  }, [currentStep, handleNext, handleBack]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#fff' }}
      edges={['top', 'bottom']}
    >
      <ErrorBoundary>
      {renderStep()}
      </ErrorBoundary>
    </SafeAreaView>
  );
};

export default ProfileSetup;


// // app/(onboarding)/profile-setup.tsx
// import { BasicInfo } from '@/components/basic-info-step';
// import SetPin from '@/components/set-pin';
// import { CompleteProfileData, PinFormData, ProfileFormData } from '@/types';
// import React, { useState, useCallback } from 'react';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useLocalSearchParams } from 'expo-router';

// const TOTAL_STEPS = 2;

// const ProfileSetup = () => {
//   const params = useLocalSearchParams();
//   const userEmail = params.email as string; // ✅ Get email from route params

//   console.log('🟢 ProfileSetup - Email received:', userEmail);

//   const [currentStep, setCurrentStep] = useState(1);
//   const [formData, setFormData] = useState<Partial<CompleteProfileData>>({
//     email: userEmail, // ✅ Initialize with email
//   });

//   const handleNext = useCallback(
//     (stepData: Partial<CompleteProfileData>) => {
//       const updatedData = { 
//         ...formData, 
//         ...stepData,
//         email: userEmail, // ✅ Always include email
//       };
      
//       console.log('🟢 Updated form data:', JSON.stringify(updatedData));
//       setFormData(updatedData);
      
//       if (currentStep < TOTAL_STEPS) {
//         console.log('🟢 Moving to next step:', currentStep + 1);
//         setCurrentStep((prev) => prev + 1);
//       }
//     },
//     [currentStep, formData, userEmail]
//   );

//   const handleBack = useCallback(() => {
//     console.log('🟢 handleBack called, current step:', currentStep);
    
//     if (currentStep > 1) {
//       setCurrentStep((prev) => prev - 1);
//     }
//   }, [currentStep]);

//   const renderStep = () => {
//     console.log('🟢 renderStep called for step:', currentStep);
    
//     switch (currentStep) {
//       case 1:
//         console.log('🟢 Rendering BasicInfo component');
//         return (
//           <BasicInfo
//             onNext={(data: ProfileFormData) => {
//               console.log('🟢 BasicInfo onNext triggered');
//               handleNext(data);
//             }}
//             initialData={formData as ProfileFormData}
//           />
//         );
//       case 2:
//         console.log('🟢 Rendering SetPin component');
//         console.log('🟢 Passing initialData to SetPin:', JSON.stringify(formData));
//         return (
//           <SetPin
//             onNext={(data: PinFormData) => {
//               console.log('🟢 SetPin onNext triggered');
//               handleNext(data);
//             }}
//             onBack={handleBack}
//             initialData={formData as any} // ✅ This now includes email
//           />
//         );
//       default:
//         console.log('🔴 Invalid step number:', currentStep);
//         return null;
//     }
//   };

//   return (
//     <SafeAreaView
//       style={{ flex: 1, backgroundColor: '#fff' }}
//       edges={['top', 'bottom']}
//     >
//       {renderStep()}
//     </SafeAreaView>
//   );
// };

// export default ProfileSetup;

// import { BasicInfo } from '@/components/basic-info-step';
// import SetPin from '@/components/set-pin';
// import { CompleteProfileData, PinFormData, ProfileFormData } from '@/types';
// import React, { useState, useCallback, useEffect } from 'react';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { AppState } from 'react-native';
// import { useLocalSearchParams } from 'expo-router';

// const TOTAL_STEPS = 2;

// const ProfileSetup = () => {
//    const params = useLocalSearchParams();
//   const userEmail = params.email as string; // ✅ Get email from route params
//   const [currentStep, setCurrentStep] = useState(1);
//   const [formData, setFormData] = useState<Partial<CompleteProfileData>>({});

//     console.log('🟢 ProfileSetup - Email received:', userEmail);

//   // Add crash detection
//   useEffect(() => {
//     console.log('🟢 ProfileSetup - Component Mounted');
//     console.log('🟢 ProfileSetup - Current Step:', currentStep);
//     console.log('🟢 ProfileSetup - Form Data:', JSON.stringify(formData));

//     // Detect when app goes to background (crash)
//     const subscription = AppState.addEventListener('change', (nextAppState) => {
//       console.log('⚠️ AppState changed to:', nextAppState);
//       if (nextAppState === 'background') {
//         console.log('🔴 App went to background - Possible crash detected!');
//         console.log('🔴 Last known step:', currentStep);
//         console.log('🔴 Last known formData:', JSON.stringify(formData));
//       }
//     });

//     return () => {
//       console.log('🔴 ProfileSetup - Component Unmounted');
//       subscription.remove();
//     };
//   }, [currentStep, formData]);

//   const handleNext = useCallback(
//     (stepData: Partial<CompleteProfileData>) => {
//       console.log('🟢 handleNext called with:', JSON.stringify(stepData));
      
//       try {
//         const updatedData = { ...formData, ...stepData };
//         console.log('🟢 Updated form data:', JSON.stringify(updatedData));
        
//         setFormData(updatedData);
        
//         if (currentStep < TOTAL_STEPS) {
//           console.log('🟢 Moving to next step:', currentStep + 1);
//           setCurrentStep((prev) => prev + 1);
//         } else {
//           console.log('🟢 Final step reached');
//         }
//       } catch (error) {
//         console.error('🔴 Error in handleNext:', error);
//       }
//     },
//     [currentStep, formData]
//   );

//   const handleBack = useCallback(() => {
//     console.log('🟢 handleBack called, current step:', currentStep);
    
//     if (currentStep > 1) {
//       setCurrentStep((prev) => prev - 1);
//     }
//   }, [currentStep]);

//   const renderStep = () => {
//     console.log('🟢 renderStep called for step:', currentStep);
    
//     try {
//       switch (currentStep) {
//         case 1:
//           console.log('🟢 Rendering BasicInfo component');
//           return (
//             <BasicInfo
//               onNext={(data: ProfileFormData) => {
//                 console.log('🟢 BasicInfo onNext triggered');
//                 handleNext(data);
//               }}
//               initialData={formData as ProfileFormData}
//             />
//           );
//         case 2:
//           console.log('🟢 Rendering SetPin component');
//           return (
//             <SetPin
//               onNext={(data: PinFormData) => {
//                 console.log('🟢 SetPin onNext triggered');
//                 handleNext(data);
//               }}
//               onBack={handleBack}
//               initialData={formData as any}
//             />
//           );
//         default:
//           console.log('🔴 Invalid step number:', currentStep);
//           return null;
//       }
//     } catch (error) {
//       console.error('🔴 Error in renderStep:', error);
//       return null;
//     }
//   };

//   console.log('🟢 ProfileSetup - About to render, step:', currentStep);

//   return (
//     <SafeAreaView
//       style={{ flex: 1, backgroundColor: '#fff' }}
//       edges={['top', 'bottom']}
//     >
//       {renderStep()}
//     </SafeAreaView>
//   );
// };

// export default ProfileSetup;

// import { BasicInfo } from '@/components/basic-info-step';
// // import SetPasscode from '@/components/set-passcode';
// import SetPin from '@/components/set-pin';
// import { CompleteProfileData, 
//   // PasscodeFormData,
//    PinFormData, ProfileFormData } from '@/types';
// import React, { useState, useCallback } from 'react';
// import { SafeAreaView } from 'react-native-safe-area-context';



// // Props for step components


// const TOTAL_STEPS = 3;

// const ProfileSetup = () => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [formData, setFormData] = useState<Partial<CompleteProfileData>>({});
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Move to the next step and merge data
//   const handleNext = useCallback(
//     (stepData: Partial<CompleteProfileData>) => {
//       const updatedData = { ...formData, ...stepData };
//       setFormData(updatedData);

//       if (currentStep < TOTAL_STEPS) {
//         setCurrentStep((prev) => prev + 1);
//       } else {
//         // Last step reached - submit all data
//         handleSubmit(updatedData as CompleteProfileData);
//       }
//     },
//     [currentStep, formData]
//   );

//   const handleBack = useCallback(() => {
//     if (currentStep > 1) {
//       setCurrentStep((prev) => prev - 1);
//     }
//   }, [currentStep]);

//   const handleSubmit = async (finalData: CompleteProfileData) => {
//     try {
//       setIsSubmitting(true);
//       console.log('Submitting Complete Profile Data:', {
//         profile: {
//           fullName: finalData.fullName,
//           phoneNumber: finalData.phoneNumber,
//           gender: finalData.gender,
//           dateOfBirth: finalData.dateOfBirth,
//           country: finalData.country,
//         },
//         security: {
//           pin: finalData.newPin, // In production, hash this before sending
//           passcode: finalData.newPasscode, // In production, hash this before sending
//         },
//       });

//       // TODO: Replace with actual API call
//       // const response = await api.createProfile({
//       //   fullName: finalData.fullName,
//       //   phoneNumber: finalData.phoneNumber,
//       //   gender: finalData.gender,
//       //   dateOfBirth: finalData.dateOfBirth,
//       //   country: finalData.country,
//       //   pin: hashPin(finalData.newPin),
//       //   passcode: hashPasscode(finalData.newPasscode),
//       // });

//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       // Success is handled by the SetPasscode component's modal
//       console.log('Profile setup completed successfully!');
//     } catch (error) {
//       console.error('Error submitting profile:', error);
//       // Handle error appropriately
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Render each setup step
//   const renderStep = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <BasicInfo
//             onNext={(data: ProfileFormData) => handleNext(data)}
//             initialData={formData}
//           />
//         );
//       case 2:
//         return (
//           <SetPin
//             onNext={(data: PinFormData) => handleNext(data)}
//             onBack={handleBack}
//             initialData={formData}
//           />
//         );
//       // case 3:
//       //   return (
//       //     <SetPasscode
//       //       onNext={(data: PasscodeFormData) => handleNext(data)}
//       //       onBack={handleBack}
//       //       initialData={formData}
//       //       isSubmitting={isSubmitting}
//       //     />
//       //   );
//       default:
//         return null;
//     }
//   };

//   return (
//     <SafeAreaView
//       style={{ flex: 1, backgroundColor: '#fff' }}
//       edges={['top', 'bottom']}
//     >
//       {renderStep()}
//     </SafeAreaView>
//   );
// };

// export default ProfileSetup;