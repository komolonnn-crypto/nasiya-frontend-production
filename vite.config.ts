import react from "@vitejs/plugin-react-swc";
import path from "path";

import { defineConfig, loadEnv } from "vite";

const PORT = 5173;

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react({
        // SWC plugin options
        jsxImportSource: "@emotion/react",
      }),
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    server: {
      port: PORT,
      host: true,
      strictPort: false,
      open: false,
    },

    preview: {
      port: PORT,
      host: true,
      strictPort: false,
    },

    build: {
      outDir: "dist",
      sourcemap: mode === "development",
      minify: "esbuild",
      target: "es2020",
      cssCodeSplit: true,
      // Optimize chunk splitting
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "mui-vendor": [
              "@mui/material",
              "@mui/icons-material",
              "@emotion/react",
              "@emotion/styled",
            ],
            "chart-vendor": ["apexcharts", "react-apexcharts"],
            "redux-vendor": ["@reduxjs/toolkit", "react-redux"],
          },
          // Clean file names
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
        },
      },

      // Chunk size warnings
      chunkSizeWarningLimit: 1000,
      // Optimize dependencies
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
    },

    // Optimize dependencies
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-router-dom",
        "@mui/material",
        "@emotion/react",
        "@emotion/styled",
      ],
      exclude: ["@vitejs/plugin-react-swc"],
    },

    // Environment variables
    envPrefix: "VITE_",

    // Performance
    esbuild: {
      logOverride: { "this-is-undefined-in-esm": "silent" },
      drop: mode === "production" ? ["console", "debugger"] : [],
    },
  };
});
