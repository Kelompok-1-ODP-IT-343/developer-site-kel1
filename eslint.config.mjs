import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Archived or unused legacy files to ignore during cleanup
      "src/app/dashboard/simulate/page-copy.tsx",
      "src/app/components/admin/**",
      "src/components/AddProperties.tsx",
      "src/components/ListProperties.tsx",
      "src/components/CustomerInfo.tsx",
      "src/components/dialogs/PropertyDetailsDialog.tsx",
      "src/components/dialogs/SimulateDialog.tsx",
      "src/components/dialogs/ViewCustomerDialogs.tsx",
      "src/components/dialogs/ViewDevelopersDialog.tsx",
      "src/services/Untitled-1.json",
    ],
  },
  {
    files: ["**/*.{ts,tsx}"] ,
    rules: {
      // Prefer explicit types but allow incremental migration
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-function-type": "warn",
      // Allow intentionally unused via underscore prefix
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Disable noisy rule; optimize images later if needed
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
