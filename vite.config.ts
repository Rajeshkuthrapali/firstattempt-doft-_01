import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // Add this import

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          admin: [
            "./src/pages/admin/AdminOverview",
            "./src/pages/admin/AdminProducts",
            "./src/pages/admin/AdminOrders",
            "./src/pages/admin/AdminInventory",
            "./src/pages/admin/AdminLogs",
            "./src/pages/admin/AdminExperiments",
          ],
          cms: [
            "./src/pages/Campaign",
            "./src/components/cms/HeroBlock",
            "./src/components/cms/GridBlock",
            "./src/components/cms/SignUpBlock",
          ],
        },
      },
    },
  },
});
