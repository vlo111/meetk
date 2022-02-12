import jwt from 'jsonwebtoken';
import _ from 'lodash';
import axios from 'axios';
import Api from '../../../Api';
import { UserData } from '../data/user';

const { REACT_APP_API_URL } = process.env;

const user = async () => {
  const requestData = {
    firstName: 'testFirstName',
    lastName: 'testLastName',
    email: UserData.email,
    password: UserData.password,
  };

  const { data: { user: createdUser, status } } = await Api.singUp(requestData);

  if (status === 'ok') {
    createdUser.password = requestData.password;
    // set status active
    const secretKey = 'wr4-)*&&zg23jk5vn)';

    const token = jwt.sign(
      {
        user: _.pick(createdUser, 'id'),
      },
      secretKey,
      {
        expiresIn: '1d',
      },
    );

    await axios.get(`${REACT_APP_API_URL}users/confirmation/${token}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return { user: createdUser, token, status };
  }

  return null;
};

module.exports = user;
