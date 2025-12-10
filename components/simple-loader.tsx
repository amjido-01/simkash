import { View, Image, Animated, StyleSheet } from "react-native";
import { useEffect, useRef } from "react";
import BottomSvg from "@/assets/images/BottomSvg.svg";
import TopLeft from "@/assets/images/topleft.svg";
import TopRight from "@/assets/images/topright.svg";

export default function SimpleLoader() {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scale]);


  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <TopRight
        width={"40%"}
        height={170}
        style={{
          position: "absolute",
          left: 0,
          top: -50,
        }}
      />
      <TopLeft
        width={"40%"}
        height={100}
        style={{
          position: "absolute",
          right: 0,
          top: -50,
        }}
      />
      <BottomSvg
        width="100%"
        height={200}
        preserveAspectRatio="xMidYMax slice"
        style={{
          position: "absolute",
          bottom: 0,
        }}
      />

      <Image
        source={require("../assets/images/splash.png")}
        resizeMode="contain"
        style={{
          width: 180,
          height: 180,
        }}
      />
    </View>
  )

  // return (
  //   <View style={styles.container}>
  //     <Animated.Image
  //       source={require("../assets/images/logo.png")}
  //       style={[styles.logo, { transform: [{ scale }] }]}
  //     />
  //   </View>
  // );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: "contain",
  },
});
