import Api from '../../../Api';

const user = async (email, password) => {
  const { data } = await Api.singIn(email, password);

  return data;
};

module.exports = user;
