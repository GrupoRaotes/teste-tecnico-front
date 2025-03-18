module.exports = {  
    root: true,
    env: {
      node: true,
      browser: true,
      es2021: true,
    },
    extends: [
      'eslint:recommended',
      'plugin:vue/recommended', // Habilita as regras recomendadas do Vue.js
      'plugin:quasar/recommended', // Habilita as regras recomendadas do Quasar
    ],
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    rules: {
      // Adicione regras personalizadas aqui, se necessário
      'no-unused-vars': 'off', // Desativa a regra
      'vue/multi-word-component-names': 'off', // Desativa a regra de nomes de componentes com várias palavras
    },
  };