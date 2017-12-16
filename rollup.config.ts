import uglify from 'rollup-plugin-uglify';

export default {
  input: 'index.js',
  output: {
    file: 'index.min.js',
    sourcemap: false,
    format: 'iife',
    name: 'Derpy'
  },
  plugins: [
    uglify()
  ]
}
