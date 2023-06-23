import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import dotenv from 'rollup-plugin-dotenv';

import pkg from './package.json';

const config = {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'auto', // Preserve both named exports and default export
    },
    {
      file: pkg.module,
      format: 'esm',
    },
    {
      file: pkg['umd:main'],
      format: 'umd',
      name: 'AirOps',
    },
    {
      file: pkg['umd:minified'],
      format: 'umd',
      name: 'AirOps',
      plugins: [terser()],
    },
  ],
  plugins: [nodePolyfills(), typescript(), commonjs(), nodeResolve(), dotenv.default()],
};

export default config;
