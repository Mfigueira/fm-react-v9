import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  test: {
    projects: [
      {
        extends: "./vite.config.ts",
        test: {
          include: ["**/*.node.test.{ts,tsx}"],
          name: "happy-dom",
          environment: "happy-dom",
        },
      },
      {
        extends: "./vite.config.ts",
        test: {
          setupFiles: ["vitest-browser-react"],
          include: ["**/*.browser.test.{ts,tsx}"],
          name: "browser",
          browser: {
            provider: playwright(),
            enabled: true,
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
