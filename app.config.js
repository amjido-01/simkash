import 'dotenv/config';

export default {
  expo: {
    name: "simkash",
    slug: "simkash",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "simkash",
    icon: "./assets/images/app-icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.simkash",
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
          backgroundColor: "#ffffff",
          image: "./assets/images/splash-light.png",
          "dark": {
            image: "./assets/images/splash-dark.png",
            backgroundColor: "#000000"
          },
          imageWidth: 200
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
