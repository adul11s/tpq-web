import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    env: { NEXT_PUBLIC_API_BASE_URL: "http://localhost:3100/api/v1" },
  },
});
