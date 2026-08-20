import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: ['.expo/**', 'node_modules/**', 'dist/**', 'android/**', 'ios/**', 'web-build/**', 'coverage/**'],
    },
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            'no-empty': 'off',
            'no-undef': 'off',
            'no-case-declarations': 'off',
            'no-dupe-keys': 'off',
            'no-useless-escape': 'off',
            'prefer-const': 'off'
        },
    }
);
