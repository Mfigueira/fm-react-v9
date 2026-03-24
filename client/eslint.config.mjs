import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";
import reactPlugin from "eslint-plugin-react";
import pluginQuery from "@tanstack/eslint-plugin-query";
import tsEslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ["dist/**", "src/routeTree.gen.ts"],
  },
  js.configs.recommended,
  ...tsEslint.configs.recommended,
  {
    ...reactPlugin.configs.flat.recommended,
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  reactPlugin.configs.flat["jsx-runtime"],
  ...pluginQuery.configs["flat/recommended"],
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "react/no-unescaped-entities": "off",
      "react/prop-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  prettier,
];
