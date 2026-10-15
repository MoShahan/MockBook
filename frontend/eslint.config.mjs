import nextVitals from "eslint-config-next/core-web-vitals"
import eslintConfigPrettier from "eslint-config-prettier"
import simpleImportSort from "eslint-plugin-simple-import-sort"

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  ...nextVitals,
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
