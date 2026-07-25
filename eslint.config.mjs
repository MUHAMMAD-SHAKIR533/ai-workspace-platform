import tseslint from "typescript-eslint";

export default [
  { ignores: ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/coverage/**"] },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
    },
    rules: {},
  },
];
