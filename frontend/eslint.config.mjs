import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"
import eslintConfigPrettier from "eslint-config-prettier"
import simpleImportSort from "eslint-plugin-simple-import-sort"

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "node_modules/**", "out/**"],
  },
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      // Existing data-fetch-in-useEffect patterns; tighten in Part 2/6
      "react-hooks/set-state-in-effect": "warn",
      "@next/next/no-img-element": "warn",

      // Type safety (Step 6.1b)
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Prefer the TS rule above
      "no-unused-vars": "off",

      // Import groups + alphabetical order within each group
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // Side-effect imports
            ["^\\u0000"],
            // Node builtins
            ["^node:"],
            // External packages (react first, then the rest A–Z)
            ["^react$", "^react-dom$", "^react/", "^@?\\w"],
            // Internal alias
            ["^@/"],
            // Relative parent/sibling
            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
            // Style imports
            ["^.+\\.s?css$"],
          ],
        },
      ],
      "simple-import-sort/exports": "error",
    },
  },
  // Disable ESLint rules that conflict with Prettier (keep last)
  eslintConfigPrettier,
]

export default eslintConfig
