//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  {
    ignores: [
      '.output/**',
      '.tanstack/**',
      'dist/**',
      'node_modules/**',
      ' public/**',
      'scripts/**',
      'src/components/ui/**',
      'src/**/*.mdx',
    ],
  },
  ...tanstackConfig,
]
