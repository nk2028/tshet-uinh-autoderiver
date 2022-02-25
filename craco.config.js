module.exports = {
  webpack: {
    configure: config => {
      config.optimization.minimizer[0].options.terserOptions.output.ascii_only = false;
      return config;
    },
  },
};
