import js from "@eslint/js"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import globals from "globals"
import tseslint from "typescript-eslint"

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // Preserve the pre-upgrade lint contract. react-hooks v7 expands its
      // recommended preset with React Compiler rules that were not part of
      // this repository's existing gate.
      "react-hooks/rules-of-hooks": "error",
      "react-refresh/only-export-components": "off",
      "react-hooks/exhaustive-deps": "off",
      // ESLint 10 added these to @eslint/js recommended. Enabling them is a
      // separate source refactor, not part of dependency security hardening.
      "no-useless-assignment": "off",
      "preserve-caught-error": "off",
      // ESLint 10 removed this from its recommended preset; keep the previous
      // repository contract explicit rather than silently weakening lint.
      "no-with": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
)
