// @ts-check

import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

import js from "@eslint/js";

export default defineConfig(
  { ignores: ["build/**/*"] },
  {
    files: ["*.?(c|m)js", "src/**/*.?(c|m)js{,x}", "src/**/*.ts{,x}"],
    extends: [
      js.configs.recommended,
      importPlugin.flatConfigs.recommended,
      react.configs.flat.recommended,
      react.configs.flat["jsx-runtime"],
      reactHooks.configs.flat.recommended,
    ],
    plugins: {
      react,
    },

    languageOptions: {
      ...react.configs.flat.recommended.languageOptions,

      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },

      ecmaVersion: "latest",
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    settings: {
      "import/core-modules": ["react", "react-dom", "react-dom/client"],
      "import/resolver": {
        typescript: true,
      },
      //"import/ignore": ["\\?(worker(&inline|&url)?|raw)$"],
      "react": {
        version: "detect",
      },
    },

    rules: {
      "import/order": [
        "error",
        {
          "groups": ["builtin", "external", "internal", ["parent", "sibling", "index"], "type", "unknown", "object"],
          "pathGroups": [
            {
              pattern: "@**/**",
              group: "external",
              position: "after",
            },
          ],
          "pathGroupsExcludedImportTypes": ["@**/**"],
          "newlines-between": "always",
          "alphabetize": { order: "asc", orderImportKind: "asc", caseInsensitive: true },
          "warnOnUnassignedImports": true,
        },
      ],
      //"import/no-unresolved": ["error", { ignore: ["\\?(?:worker(&inline|&url)?|raw)$"] }],
    },
  },
  {
    files: ["src/**/*.ts{,x}"],
    extends: [
      importPlugin.flatConfigs.typescript,
      ...tseslint.configs.recommendedTypeChecked,
      // ...tseslint.configs.strictTypeChecked,
      //...tseslint.configs.stylisticTypeChecked,
    ],

    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },

    rules: {
      "@typescript-eslint/no-unused-expressions": [
        "error",
        {
          allowShortCircuit: true,
          allowTaggedTemplates: true,
        },
      ],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowNever: true,
        },
      ],
      "@typescript-eslint/unbound-method": [
        "error",
        {
          ignoreStatic: true,
        },
      ],

      // TODO new rule that affects too many places, suppressing for now
      "@typescript-eslint/no-misused-promises": "off",
    },
  },
  eslintConfigPrettier,
);
