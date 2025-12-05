import { View, StyleSheet } from "react-native";
import { PaystackWebView } from "react-native-paystack-webview";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function PaystackPayment() {
  const router = useRouter();
  const { url } = useLocalSearchParams(); // URL from your backend

  if (!url) return null;

  return (
    <View style={styles.container}>
      <PaystackWebView
        paystackKey="pk_live_or_test_here" // required by library but not used for backend URL
        amount={10} // ignored since you are loading an authorization URL
        billingEmail="example@mail.com"
        
        // The magic: load your backend-generated payment link
        paystackUri={url.toString()} 

        autoStart={true}
        onSuccess={(res: any) => {
          console.log("Payment success:", res);
          router.back();
        }}
        onCancel={() => {
          console.log("Payment canceled");
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
