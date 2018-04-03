import uglify from 'rollup-plugin-uglify';

const getBuildOptions = (name) => ({
  input: `${name}.js`,
  output: {
    file: `${name}.min.js`,
    sourcemap: true,
    format: 'iife',
    name: 'Overstate',
  },
  plugins: [uglify()],
});

export default [
  getBuildOptions('index'),
  getBuildOptions('fp'),
];
