module.exports = {
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "next/core-web-vitals"
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-implicit-coercion": "error",
    "no-var": "error",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  },
  "globals": {
    "JSX": true
  }
}
