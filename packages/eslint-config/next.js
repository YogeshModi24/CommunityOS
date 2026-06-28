module.exports = {
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  plugins: ["simple-import-sort", "unused-imports"],
  rules: {
    "react/no-unescaped-entities": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-console": "warn",

    // Import & Export Sorting
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",

    // Unused Import Detection & Auto-pruning
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        "vars": "all",
        "varsIgnorePattern": "^_",
        "args": "after-used",
        "argsIgnorePattern": "^_"
      }
    ],

    // Architecture Boundary Rules (Sprint 0.1)
    // Structured to be easily migratable to dependency-cruiser
    "no-restricted-imports": ["error", {
      "patterns": [
        {
          "group": [
            "**/apps/*/**",
            "**/apps/*",
            "../api/**",
            "../../api/**",
            "../../../api/**",
            "../web/**",
            "../../web/**",
            "../../../web/**",
            "../worker/**",
            "../../worker/**",
            "../../../worker/**",
            "../admin/**",
            "../../admin/**",
            "../../../admin/**"
          ],
          "message": "Direct cross-application dependencies are forbidden. Use shared packages under packages/ instead."
        }
      ]
    }]
  }
};
