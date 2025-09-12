module.exports = {
  extends: [
    "next/core-web-vitals"
  ],
  rules: {
    // Allow React without import in Next.js 13+ with App Router
    "react/react-in-jsx-scope": "off",
    // Relax some strict rules for the initial implementation
    "no-console": "warn",
    "react/require-default-props": "off",
    "no-trailing-spaces": "warn",
    "eol-last": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
  },
};