import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";

export default {
  input: 'src/index.js',
  output: {
    file: 'index.min.js',
    format: 'umd',
    name: 'Autoderiver',
  },
  plugins: [
    commonjs(),
    nodeResolve(),
    terser({
      mangle: {
        reserved: ['callDeriver'],
      },
    }),
  ],
};
