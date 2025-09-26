module.exports = {
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      processor: null,
      rules: {
        'no-unused-vars': 'warn'
      }
    }
  ]
};
