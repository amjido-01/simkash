import 'dotenv/config';

export default {
  expo: {
    name: "simkash",
    slug: "simkash",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "simkash",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.simkash",
      splash: {
        image: "./assets/images/splash.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      },
      associatedDomains: [
        "applinks:simkash.com",
        "applinks:www.simkash.com"
      ]
    },

    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      splash: {
        image: "./assets/images/splash.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff",
        mdpi: "./assets/images/splash.png",
        hdpi: "./assets/images/splash.png",
        xhdpi: "./assets/images/splash.png",
        xxhdpi: "./assets/images/splash.png",
        xxxhdpi: "./assets/images/splash.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.anonymous.simkash",
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            {
              scheme: "https",
              host: "simkash.com",
              pathPrefix: "/successpage"
            },
            {
              scheme: "https",
              host: "www.simkash.com",
              pathPrefix: "/successpage"
            },
            {
              scheme: "simkash"
            }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },

    web: {
      output: "static",
      favicon: "./assets/images/favicon.png"
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/plants.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      "expo-secure-store",
      [
        "expo-web-browser",
        { experimentalLauncherActivity: true }
      ]
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },

    // 👇 THIS IS THE IMPORTANT PART
    extra: {
      router: {},
      API_BASE_URL: process.env.EXPO_PUBLIC_API_URL || "https://api.simkash.com/api/v1",
      eas: {
        projectId: "24c4f6ee-3cae-4ad4-bb8f-ce4f9ac4b1ef"
      }
    }
  }
};
