import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist/', '.next/', 'coverage/', 'node_modules/', '.git/', 'test-results/', 'playwright-report/', 'public/sw.js']
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'off'
    }
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        localStorage: 'readonly',
        console: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      'no-console': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-unused-vars': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error'
    }
  },
  {
    files: ['**/*.{test,spec}.{ts,tsx}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
        vi: 'readonly'
      }
    }
  },
  {
    files: ['logic/**/*.{ts,tsx}', 'services/**/*.{ts,tsx}', 'utils/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/components/*', '@/toolkit/*', '@/app/*', '@/core/ui/*'],
            message: 'Слои logic/services/utils не должны зависеть от UI, toolkit или Next routes.'
          },
          {
            group: ['../components/*', '../toolkit/*', '../app/*', '../core/ui/*'],
            message: 'Слои logic/services/utils не должны зависеть от UI, toolkit или Next routes.'
          }
        ]
      }]
    }
  },
  {
    files: ['components/**/*.{ts,tsx}', 'toolkit/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/app/*', '../app/*', '../../app/*', './app/*'],
            message: 'UI-код не должен зависеть от Next route files. Используйте core/entities/features.'
          },
          {
            group: ['@/services/*', '@/logic/*'],
            message: 'UI/shell не должны обращаться к services/logic напрямую. Используйте entities/features/hooks.'
          }
        ]
      }]
    }
  },
  {
    files: ['entities/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/components/*', '@/toolkit/*', '@/app/*', '@/core/ui/*'],
            message: 'Entities не должны зависеть от UI, toolkit или Next routes.'
          }
        ]
      }]
    }
  },
  {
    files: ['features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/toolkit/*', '@/app/*', '@/core/ui/*'],
            message: 'Features не должны зависеть от toolkit, Next routes или app-shell UI.'
          }
        ]
      }]
    }
  },
  {
    files: ['core/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['@/components/AboutTab/*', '@/components/CharacterSheet/*', '@/components/CyberwareModule/*', '@/components/DevPatchnotesTab/*', '@/components/GearModule/*', '@/components/NetrunningModule/*', '@/components/NewbieMapTab/*'],
            message: 'Core не должен зависеть от конкретных экранов и feature-модулей.'
          },
          {
            group: ['@/toolkit/*', '@/app/*'],
            message: 'Core не должен зависеть от toolkit entry или Next route files.'
          }
        ]
      }]
    }
  },
  prettierConfig
];
