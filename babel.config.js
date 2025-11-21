module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // ❌ REMOVE THIS: 'react-native-worklets/plugin', 
      
      // ✅ Keep the module-resolver plugin
      ["module-resolver", {
        root: ["./"],
        alias: {
          "@": "./",
          "tailwind.config": "./tailwind.config.js"
        }
      }],
      
      // ✅ Keep the Reanimated plugin and ensure it's LAST!
      'react-native-reanimated/plugin', 
    ]
  };
};