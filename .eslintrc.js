module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        'plugin:vue/essential',
        '@vue/standard'
    ],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        semi: ['error', 'always'],
        quotes: ['error', 'single'],
        indent: ['warn', 4],
        'no-new': ['warn'],
        'spaced-comment': ['warn', 'never'],
        'no-unused-vars': ['warn'],
        'no-multiple-empty-lines': ['warn'],
        'vue/no-unused-components': ['warn']
    },
    parserOptions: {
        parser: 'babel-eslint'
    }
};
