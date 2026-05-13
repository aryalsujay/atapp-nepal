/**
 * ESLint flat config for the Dhamma AT App.
 * Extends Expo's recommended preset (TypeScript + React Native) and integrates
 * Prettier as a lint rule so formatting violations show up alongside lint errors.
 *
 * Rule severity is intentionally lenient during the R0 + R1 refactor — most
 * defaults from `eslint-config-expo` already flag the things we care about.
 * Once R1 burns down the legacy `any` casts and silent catches, this file
 * can be tightened (see commented-out rules at the bottom).
 */

const expoConfig = require('eslint-config-expo/flat');
const prettierPluginRecommended = require('eslint-plugin-prettier/recommended');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = [
  // Ignored paths — applied globally
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'web-build/**',
      'specs/**',
      'assets/**',
      'babel.config.js',
      'metro.config.js',
      'eslint.config.js',
    ],
  },

  // Expo's recommended preset (TS, React, RN, accessibility)
  ...expoConfig,

  // Prettier — must come last to disable conflicting style rules
  prettierPluginRecommended,
  prettierConfig,

  // Tell eslint-plugin-react which React version we ship — auto-detect fails
  // in some monorepo / hoisted-deps layouts.
  {
    settings: {
      react: {
        version: '19.1.0',
      },
    },
  },

  // Project-specific tweaks (built-in rules only — plugin rules live in expoConfig)
  {
    rules: {
      // Single quotes (matches Prettier config).
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],

      // No console.* except warn/error.
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Prettier reports format violations as lint errors.
      'prettier/prettier': 'error',

      // Apostrophes in JSX text are fine — disabling the cosmetic rule.
      'react/no-unescaped-entities': 'off',
    },
  },

  // Node scripts — allow node globals (__dirname, require, process, etc.)
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      globals: {
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },

  // Future tightening (uncomment after R1 lands)
  // {
  //   rules: {
  //     '@typescript-eslint/no-explicit-any': 'error',
  //     'react-hooks/exhaustive-deps': 'error',
  //   },
  // },
];
