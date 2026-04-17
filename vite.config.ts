import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          // React core MUST be in its own chunk and resolved first.
          // Match react, react-dom, react/jsx-runtime, scheduler, use-sync-external-store
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/") ||
            id.includes("/use-sync-external-store/") ||
            id.includes("react/jsx-runtime") ||
            id.includes("react/jsx-dev-runtime")
          ) {
            return "react-vendor";
          }

          // React Router depends on react — separate chunk, loaded after react-vendor
          if (id.includes("react-router")) return "react-vendor";

          // Heavy data-viz library — only Grades uses it
          if (id.includes("recharts") || id.includes("d3-")) return "charts";

          // Animation library — used everywhere but large
          if (id.includes("framer-motion")) return "framer";

          // Supabase client
          if (id.includes("@supabase")) return "supabase";

          // Radix UI primitives (shadcn)
          if (id.includes("@radix-ui")) return "radix";

          // Date/calendar libraries
          if (id.includes("date-fns") || id.includes("react-day-picker")) return "dates";

          // Form libs
          if (id.includes("react-hook-form") || id.includes("@hookform") || id.includes("zod")) return "forms";

          // Icons
          if (id.includes("lucide-react")) return "icons";

          // Tanstack
          if (id.includes("@tanstack")) return "tanstack";

          return "vendor";
        },
      },
    },
  },
}));
