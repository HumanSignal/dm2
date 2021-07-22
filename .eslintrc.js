module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  globals: {
    process: true,
    module: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint"],
  rules: {
    "react/prop-types": "off",
    "react/display-name": "off",
    "react/no-children-prop": "off",
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    '@typescript-eslint/indent': ["error", 2],
    "no-async-promise-executor": "off",
    "semi": [2, "always"],
    "comma-dangle": ["error", {
      "imports": "never",
      "exports": "never",
      "functions": "always-multiline",
      "objects": "always-multiline",
      "arrays": "always-multiline",
    }],
    "object-curly-spacing": ["error", "always"],
    "array-bracket-spacing": ["error", "never"],
    "object-shorthand": ["error", "always"],
    "eqeqeq": ["error", "always"],
    "indent": ["error", 2, {
      "SwitchCase": 1,
    }],
  },
};
