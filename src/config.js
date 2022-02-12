const { REACT_APP_MODE } = process.env;
const config = {
  dev: {
    API_URL: 'test',
  },
  prod: {},
  local: {},
};

export default config[REACT_APP_MODE] || config.prod;
