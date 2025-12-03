import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ChevronLeft, AlertCircle, ChevronDown, Wallet, Gift } from "lucide-react-native";
import * as yup from "yup";

// Constants
const NETWORKS = [
  { value: "mtn", label: "MTN", icon: "📱" },
  { value: "glo", label: "Glo", icon: "📱" },
  { value: "airtel", label: "Airtel", icon: "📱" },
  { value: "9mobile", label: "9Mobile", icon: "📱" },
];

const QUICK_AMOUNTS = [
  { value: "100", label: "₦100" },
  { value: "200", label: "₦200" },
  { value: "300", label: "₦300" },
  { value: "400", label: "₦400" },
  { value: "100", label: "₦100" },
  { value: "200", label: "₦200" },
  { value: "300", label: "₦300" },
  { value: "400", label: "₦400" },
];

const PIN_LENGTH = 4;
const OTP_LENGTH = 6;

// Validation schema
const schema = yup.object().shape({
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]+$/, "Phone number must contain only digits")
    .length(11, "Phone number must be exactly 11 digits"),
  network: yup.string().required("Please select a network"),
  amount: yup
    .string()
    .required("Please enter amount")
    .matches(/^[0-9]+$/, "Amount must contain only numbers")
    .test("min-amount", "Minimum amount is ₦100", (value) => {
      if (!value) return false;
      return parseInt(value, 10) >= 100;
    })
    .test("max-amount", "Maximum amount is ₦500,000", (value) => {
      if (!value) return false;
      return parseInt(value, 10) <= 500000;
    }),
  sharePin: yup
    .string()
    .required("Share PIN is required")
    .matches(/^[0-9]+$/, "Share PIN must contain only digits")
    .min(4, "Share PIN must be at least 4 digits"),
});

export default function AirtimeToCash() {
  // Form state
  const [formData, setFormData] = useState({
    phoneNumber: "",
    network: "",
    amount: "",
    sharePin: "",
  });
  
  const [receiveAmount, setReceiveAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState("");
  
  // Drawer states
  const [showNetworkSelect, setShowNetworkSelect] = useState(false);
  const [showOtpDrawer, setShowOtpDrawer] = useState(false);
  const [showConfirmDrawer, setShowConfirmDrawer] = useState(false);
  const [showPinDrawer, setShowPinDrawer] = useState(false);
  
  // OTP and PIN states
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpTimer, setOtpTimer] = useState(32);
  
  // Validation errors
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // Calculate receive amount (80% conversion rate)
  const calculateReceiveAmount = (amt: string) => {
    if (!amt) return "";
    const converted = Math.floor(parseInt(amt) * 0.8);
    return converted.toString();
  };

  // Update form field
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle amount change
  const handleAmountChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    updateField("amount", cleaned);
    setSelectedAmount(cleaned);
    setReceiveAmount(calculateReceiveAmount(cleaned));
  };

  // Quick amount selection
  const handleQuickAmountSelect = (value: string) => {
    updateField("amount", value);
    setSelectedAmount(value);
    setReceiveAmount(calculateReceiveAmount(value));
  };

  // Validate form with Yup
  const validateForm = async () => {
    try {
      await schema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
      } catch (err) {
      const validationErrors: Record<string, string> = {};
      if (err instanceof yup.ValidationError && Array.isArray(err.inner)) {
        err.inner.forEach((error: yup.ValidationError) => {
          if (typeof error.path === "string" && error.path) {
            validationErrors[error.path] = error.message;
          }
        });
      }
      setErrors(validationErrors);
      return false;
    }
  };

  // Handle continue to OTP
  const handleContinue = async () => {
    const isValid = await validateForm();
    
    if (!isValid) {
      return;
    }
    
    setShowOtpDrawer(true);
    setOtpTimer(32);
    
    // Start OTP timer
    const timer = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle OTP input
  const handleOtpInput = (num: string) => {
    if (otp.length < OTP_LENGTH) {
      const newOtp = otp + num;
      setOtp(newOtp);
      setOtpError("");
      
      // Auto-submit when complete
      if (newOtp.length === OTP_LENGTH) {
        setTimeout(() => handleOtpSubmit(newOtp), 300);
      }
    }
  };

  // Handle OTP backspace
  const handleOtpBackspace = () => {
    if (otp.length > 0) {
      setOtp(otp.slice(0, -1));
      setOtpError("");
    }
  };

  // Submit OTP
  const handleOtpSubmit = async (otpToSubmit: string) => {
    const finalOtp = otpToSubmit || otp;
    
    if (finalOtp.length !== OTP_LENGTH) {
      setOtpError("Please enter the 6-digit code");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Success - move to confirmation
      setShowOtpDrawer(false);
      setTimeout(() => {
        setShowConfirmDrawer(true);
      }, 300);
    } catch (error) {
      setOtpError("Invalid code. Please try again.");
      setOtp("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Continue to PIN from confirmation
  const handleContinueToPin = () => {
    setShowConfirmDrawer(false);
    setTimeout(() => {
      setShowPinDrawer(true);
    }, 300);
  };

  // Handle PIN input
  const handlePinInput = (num: string) => {
    if (pin.length < PIN_LENGTH) {
      const newPin = pin + num;
      setPin(newPin);
      setPinError("");
      
      // Auto-submit when complete
      if (newPin.length === PIN_LENGTH) {
        setTimeout(() => handlePinSubmit(newPin), 300);
      }
    }
  };

  // Handle PIN backspace
  const handlePinBackspace = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
      setPinError("");
    }
  };

  // Submit PIN
  const handlePinSubmit = async (pinToSubmit: string) => {
    const finalPin = pinToSubmit || pin;
    
    if (finalPin.length !== PIN_LENGTH) {
      setPinError("Please enter your 4-digit PIN");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Success
      setShowPinDrawer(false);
      Alert.alert(
        "Success!",
        `Airtime converted successfully! You'll receive ₦${receiveAmount}`,
        [{ text: "OK" }]
      );
      
      // Reset form
      setFormData({
        phoneNumber: "",
        network: "",
        amount: "",
        sharePin: "",
      });
      setReceiveAmount("");
      setSelectedAmount("");
      setOtp("");
      setPin("");
      setErrors({});
    } catch (error) {
      setPinError("Invalid PIN. Please try again.");
      setPin("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAmount = (amt: string) => {
    if (!amt) return "";
    return parseInt(amt).toLocaleString();
  };

  const selectedNetwork = NETWORKS.find(n => n.value === formData.network);

  return (
    <div className="flex flex-col h-screen bg-white max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-center px-4 py-3 border-b border-gray-100 relative">
        <TouchableOpacity
          className="absolute left-4"
          onPress={() => Alert.alert("Go back")}
        >
          <ChevronLeft size={24} color="#000000" />
        </TouchableOpacity>
        <Text className="text-base font-semibold">Airtime to Cash</Text>
      </div>

      {/* Form Content */}
      <ScrollView className="flex-1 px-4 pt-6">
        {/* Phone Number */}
        <div className="mb-6">
          <label className="text-xs text-gray-600 mb-2 block">Phone Number</label>
          <div className={`flex items-center border rounded-full overflow-hidden ${
            errors.phoneNumber || errors.network ? "border-red-500 border-2" : "border-gray-300"
          }`}>
            {/* Network Selector */}
            <TouchableOpacity
              className="flex items-center px-3 border-r border-gray-200"
              onPress={() => setShowNetworkSelect(!showNetworkSelect)}
            >
              <Text className="text-xl mr-1">{selectedNetwork?.icon || "📱"}</Text>
              <ChevronDown size={16} />
            </TouchableOpacity>

            {/* Phone Input */}
            <input
              type="tel"
              placeholder="Enter your phone number"
              className="flex-1 px-3 py-3 text-sm outline-none"
              value={formData.phoneNumber}
              maxLength={11}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^0-9]/g, "");
                updateField("phoneNumber", cleaned);
              }}
            />
          </div>
          {(errors.phoneNumber || errors.network) && (
            <div className="flex items-center mt-1 text-red-500 text-xs">
              <AlertCircle size={12} className="mr-1" />
              <span>{errors.phoneNumber || errors.network}</span>
            </div>
          )}

          {/* Network Dropdown */}
          {showNetworkSelect && (
            <div className="mt-2 border border-gray-200 rounded-xl bg-white shadow-lg">
              {NETWORKS.map((net) => (
                <TouchableOpacity
                  key={net.value}
                  className="flex items-center px-4 py-3 border-b border-gray-100 last:border-b-0"
                  onPress={() => {
                    updateField("network", net.value);
                    setShowNetworkSelect(false);
                  }}
                >
                  <Text className="text-sm">{net.icon} {net.label}</Text>
                </TouchableOpacity>
              ))}
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="mb-4">
          <label className="text-xs text-gray-600 mb-2 block">Amount</label>
          <div className={`flex items-center border rounded-full overflow-hidden ${
            errors.amount ? "border-red-500 border-2" : "border-gray-300"
          }`}>
            <div className="px-4 border-r border-gray-200">
              <Text className="text-sm font-semibold">₦</Text>
            </div>
            <input
              type="tel"
              placeholder="₦100 - ₦500,000"
              className="flex-1 px-3 py-3 text-sm outline-none"
              value={formData.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
            />
          </div>
          {errors.amount && (
            <div className="flex items-center mt-1 text-red-500 text-xs">
              <AlertCircle size={12} className="mr-1" />
              <span>{errors.amount}</span>
            </div>
          )}
        </div>

        {/* Quick Amounts */}
        <div className="flex flex-wrap -mx-1 mb-6">
          {QUICK_AMOUNTS.map((qa, idx) => (
            <TouchableOpacity
              key={idx}
              className={`w-1/4 px-1 mb-2`}
              onPress={() => handleQuickAmountSelect(qa.value)}
            >
              <div className={`h-10 rounded-xl flex items-center justify-center ${
                selectedAmount === qa.value || formData.amount === qa.value
                  ? "bg-[#132939]"
                  : "bg-white border border-gray-200"
              }`}>
                <Text className={`text-sm font-medium ${
                  selectedAmount === qa.value || formData.amount === qa.value
                    ? "text-white"
                    : "text-gray-600"
                }`}>
                  {qa.label}
                </Text>
              </div>
            </TouchableOpacity>
          ))}
        </div>

        {/* Amount You'll Receive */}
        <div className="mb-6">
          <label className="text-xs text-gray-600 mb-2 block">Amount youll receive</label>
          <div className="flex items-center border border-gray-300 rounded-full bg-gray-50">
            <div className="px-4 border-r border-gray-200">
              <Text className="text-sm font-semibold">₦</Text>
            </div>
            <input
              type="text"
              className="flex-1 px-3 py-3 text-sm bg-transparent outline-none"
              value={receiveAmount}
              readOnly
              placeholder="0"
            />
            {receiveAmount && (
              <div className="px-3">
                <span className="text-xs text-gray-500">⊗</span>
              </div>
            )}
          </div>
        </div>

        {/* Share Pin */}
        <div className="mb-8">
          <label className="text-xs text-gray-600 mb-2 block">Share Pin</label>
          <input
            type="text"
            placeholder="Enter Number share PIN"
            className={`w-full px-4 py-3 text-sm border rounded-full outline-none ${
              errors.sharePin ? "border-red-500 border-2" : "border-gray-300"
            }`}
            value={formData.sharePin}
            onChange={(e) => updateField("sharePin", e.target.value)}
          />
          {errors.sharePin && (
            <div className="flex items-center mt-1 text-red-500 text-xs">
              <AlertCircle size={12} className="mr-1" />
              <span>{errors.sharePin}</span>
            </div>
          )}
        </div>
      </ScrollView>

      {/* Continue Button */}
      <div className="px-4 py-4 border-t border-gray-100">
        <TouchableOpacity
          className="bg-[#132939] rounded-full h-12 flex items-center justify-center"
          onPress={handleContinue}
        >
          <Text className="text-white text-base font-medium">Continue</Text>
        </TouchableOpacity>
      </div>

      {/* OTP Drawer */}
      {showOtpDrawer && (
        <div className="fixed inset-0 bg-black/25 flex items-end z-50">
          <div className="bg-white w-full rounded-t-[30px] pt-10 pb-8 px-4 max-w-md mx-auto">
            {!isSubmitting && (
              <TouchableOpacity
                className="absolute top-4 right-4"
                onPress={() => setShowOtpDrawer(false)}
              >
                <span className="text-2xl">×</span>
              </TouchableOpacity>
            )}

            <h2 className="text-lg font-semibold text-center mb-2">OTP Verification</h2>
            <p className="text-xs text-gray-600 text-center mb-6">
              Weve sent a 6-digit code to [{formData.phoneNumber}] Please enter it to proceed.
            </p>

            {/* OTP Input Display */}
            <div className="flex justify-center gap-2 mb-6">
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <div
                  key={i}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center ${
                    otpError ? "border-red-500" : otp.length > i ? "border-green-500" : "border-gray-200"
                  }`}
                >
                  <Text className="text-2xl font-semibold">
                    {otp[i] || "0"}
                  </Text>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 text-center mb-6">
              Resend code in {otpTimer}s
            </p>

            {otpError && !isSubmitting && (
              <p className="text-red-500 text-xs text-center mb-4">{otpError}</p>
            )}

            {isSubmitting && (
              <div className="flex flex-col items-center mb-6">
                <ActivityIndicator size="small" color="#132939" />
                <Text className="text-xs text-gray-600 mt-2">Verifying...</Text>
              </div>
            )}

            {/* Number Keypad */}
            {!isSubmitting && (
              <div className="max-w-[320px] mx-auto">
                {[[1, 2, 3], [4, 5, 6], [7, 8, 9]].map((row, i) => (
                  <div key={i} className="flex justify-between mb-4 px-4">
                    {row.map((num) => (
                      <TouchableOpacity
                        key={num}
                        className="w-16 h-14 flex items-center justify-center"
                        onPress={() => handleOtpInput(num.toString())}
                      >
                        <Text className="text-2xl font-semibold">{num}</Text>
                      </TouchableOpacity>
                    ))}
                  </div>
                ))}
                <div className="flex justify-between px-4">
                  <div className="w-16" />
                  <TouchableOpacity
                    className="w-16 h-14 flex items-center justify-center"
                    onPress={() => handleOtpInput("0")}
                  >
                    <Text className="text-2xl font-semibold">0</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-16 h-14 flex items-center justify-center"
                    onPress={handleOtpBackspace}
                  >
                    <Text className="text-2xl">⌫</Text>
                  </TouchableOpacity>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Drawer */}
      {showConfirmDrawer && (
        <div className="fixed inset-0 bg-black/25 flex items-end z-50">
          <div className="bg-white w-full rounded-t-[30px] pt-7 pb-6 px-6 max-w-md mx-auto">
            <TouchableOpacity
              className="absolute top-4 right-4"
              onPress={() => setShowConfirmDrawer(false)}
            >
              <span className="text-2xl">×</span>
            </TouchableOpacity>

            <h2 className="text-lg font-semibold text-center mb-1">Confirm Transaction</h2>
            <p className="text-xs text-gray-600 text-center mb-5">
              Please review details carefully. transactions are irreversible.
            </p>

            <h3 className="text-3xl font-bold text-center mb-6">₦{formatAmount(formData.amount)}</h3>

            {/* Transaction Details */}
            <div className="border border-gray-200 rounded-2xl p-4 mb-4">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <Text className="text-xs text-gray-600">Phone Number</Text>
                <Text className="text-xs font-semibold">{formData.phoneNumber}</Text>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <Text className="text-xs text-gray-600">Airtime Amount</Text>
                <Text className="text-xs font-semibold">₦{formatAmount(formData.amount)}</Text>
              </div>
              <div className="flex justify-between py-3">
                <Text className="text-xs text-gray-600">Amount youll Receive</Text>
                <Text className="text-xs font-semibold">₦{formatAmount(receiveAmount)}</Text>
              </div>
            </div>

            {/* Wallet & Cashback */}
            <div className="px-4 mb-6">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Wallet size={16} color="#FF8D28" />
                  <Text className="text-xs text-gray-600">Wallet Balance</Text>
                </div>
                <Text className="text-xs font-semibold">₦50,000</Text>
              </div>
              <div className="flex justify-between items-center py-3">
                <div className="flex items-center gap-2">
                  <Gift size={16} color="#CB30E0" />
                  <Text className="text-xs text-gray-600">Cashback</Text>
                </div>
                <Text className="text-xs font-semibold text-green-600">+₦500</Text>
              </div>
            </div>

            {/* Confirm Button */}
            <TouchableOpacity
              className="bg-[#132939] rounded-full h-12 flex items-center justify-center"
              onPress={handleContinueToPin}
            >
              <Text className="text-white text-base font-medium">Confirm</Text>
            </TouchableOpacity>
          </div>
        </div>
      )}

      {/* PIN Drawer */}
      {showPinDrawer && (
        <div className="fixed inset-0 bg-black/25 flex items-end z-50">
          <div className="bg-white w-full rounded-t-[30px] pt-10 pb-8 px-4 max-w-md mx-auto">
            {!isSubmitting && (
              <TouchableOpacity
                className="absolute top-4 right-4"
                onPress={() => setShowPinDrawer(false)}
              >
                <span className="text-2xl">×</span>
              </TouchableOpacity>
            )}

            <h2 className="text-lg font-semibold text-center mb-8">Enter PIN</h2>

            {/* PIN Input Display */}
            <div className="flex justify-center gap-2 mb-6">
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <div
                  key={i}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center ${
                    pinError ? "border-red-500" : pin.length > i ? "border-green-500" : "border-gray-200"
                  }`}
                >
                  <Text className="text-3xl font-semibold">
                    {pin[i] ? "•" : ""}
                  </Text>
                </div>
              ))}
            </div>

            {pinError && !isSubmitting && (
              <p className="text-red-500 text-xs text-center mb-4">{pinError}</p>
            )}

            {isSubmitting && (
              <div className="flex flex-col items-center mb-6">
                <ActivityIndicator size="small" color="#132939" />
                <Text className="text-xs text-gray-600 mt-2">Processing transaction...</Text>
              </div>
            )}

            {/* Number Keypad */}
            {!isSubmitting && (
              <div className="max-w-[320px] mx-auto">
                {[[1, 2, 3], [4, 5, 6], [7, 8, 9]].map((row, i) => (
                  <div key={i} className="flex justify-between mb-4 px-4">
                    {row.map((num) => (
                      <TouchableOpacity
                        key={num}
                        className="w-16 h-14 flex items-center justify-center"
                        onPress={() => handlePinInput(num.toString())}
                      >
                        <Text className="text-2xl font-semibold">{num}</Text>
                      </TouchableOpacity>
                    ))}
                  </div>
                ))}
                <div className="flex justify-between px-4">
                  <TouchableOpacity
                    className="w-16 h-14 flex items-center justify-center"
                    onPress={() => Alert.alert("Biometric", "Biometric authentication")}
                  >
                    <Text className="text-2xl">👆</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-16 h-14 flex items-center justify-center"
                    onPress={() => handlePinInput("0")}
                  >
                    <Text className="text-2xl font-semibold">0</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-16 h-14 flex items-center justify-center"
                    onPress={handlePinBackspace}
                  >
                    <Text className={`text-2xl ${pin.length === 0 ? "opacity-30" : ""}`}>⌫</Text>
                  </TouchableOpacity>
                </div>

                <TouchableOpacity className="mt-6" onPress={() => Alert.alert("Forgot PIN", "Contact support")}>
                  <Text className="text-sm font-semibold text-[#132939] text-center">
                    Forgot PIN?
                  </Text>
                </TouchableOpacity>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}