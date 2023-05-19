/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  'bail': true,
  'roots': [
    '<rootDir>/src',
  ],
  'preset': 'ts-jest',
  'setupFilesAfterEnv': ['./jest.setup.js'],
  'testEnvironment': 'jsdom',
  'verbose': false,
  'coverageDirectory': 'coverage',
  'coverageReporters': ['json', 'lcov', 'clover'],
  'coverageThreshold': {
    'global': {
      'branches': 1,
      'functions': 1,
      'lines': 1,
      'statements': 1,
    },
  },
  'globals' : {
    'APP_SETTINGS': {
      'feature_flags': {},
    },
  },
  'transform': {
    '^.+\\.[tj]sx?$': ['babel-jest', {
      'presets': [
        ['@babel/preset-react', {
          'runtime': 'automatic',
        }],
        '@babel/preset-typescript',
        ['@babel/preset-env', {
          'targets': {
            'browsers': ['last 2 Chrome versions'],
            'node': 'current',
          },
        }],
      ],
      'plugins': [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-private-methods',
        '@babel/plugin-proposal-optional-chaining',
        '@babel/plugin-proposal-nullish-coalescing-operator',
      ],
    }],
  },
  'moduleFileExtensions': [
    'js',
    'ts',
    'jsx',
    'tsx',
  ],
  'moduleDirectories': [
    'node_modules',
  ],
  'moduleNameMapper': {
    '\\.(s[ac]ss|css|styl|png|gif|jpe?g)$': 'identity-obj-proxy',
    '\\.svg$': '<rootDir>/__mocks__/svg.js',
  },
  'testPathIgnorePatterns': [
    '/node_modules/',
    '/dist/',
  ],
  "testRegex": "__tests__/.*.test.[tj]sx?$",
  'transformIgnorePatterns': [
    'node_modules/?!(nanoid|konva)',
  ],
};
