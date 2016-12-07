import buble from 'rollup-plugin-buble';

export default {
  entry: 'nerve-cat.js',
  plugins: [ buble({
    transforms: { dangerousForOf: true }
  }) ],
  dest: 'bundle.js'
};
