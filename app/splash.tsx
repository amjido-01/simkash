import BottomSvg from "@/assets/images/BottomSvg.svg";
import TopLeft from "@/assets/images/topleft.svg";
import TopRight from "@/assets/images/topright.svg";
import { Image, View } from "react-native";

export default function Splash() {
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
        height={200} // choose a fixed height
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
  );
}
