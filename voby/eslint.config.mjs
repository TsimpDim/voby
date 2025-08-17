// eslint.config.mjs (or eslint.config.js if "type": "module" is set in package.json)
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import eslint from "@eslint/js";

export default defineConfig([
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/build/**",
      "**/.cache/**",
      "**/.tmp/**",
      "**/.vscode/**",
      "**/.idea/**",
      "**/*.env",
      "**/*.log"
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.stylistic,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      semi: "error",
      quotes: ["error", "single"],
      curly: "error",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]);
