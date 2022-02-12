import axios from 'axios';
import signIn from './helpers/user/signIn';
import signUp from './helpers/user/signUp';
import { UserData, userRequestData } from './helpers/data/user';
import { nodeRequestData, graphRequestData } from './helpers/data/graphs';

const { REACT_APP_API_URL } = process.env;

jest.unmock('axios');

/**
 * Api requests realtime
 * Create test user if doesn't exist with test/fake data in real db
 * Sign in with created user data
 * Add/delete test graph with title and description
 * Create new node, should be in db, expect returned data and update
 */
describe('api request', () => {
  let user = null;
  let status = '';
  let token = '';
  let graphId = null;
  let nodes = null;
  let errors = null;

  const getData = (uri, formData) => axios.post(`${REACT_APP_API_URL}${uri}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const cleanUserForExpect = (data) => {
    delete data.id;
    delete data.avatar;
    delete data.createdAt;
    delete data.updatedAt;
  };

  const cleanNodeForExpect = (node) => {
    delete node.createdAt;
    delete node.updatedAt;
    delete node.createdUser;
    delete node.updatedUser;
  };

  const login = () => signIn(UserData.email, UserData.password);

  beforeAll(async () => {
    try {
      ({ user, status, token } = await login());
    } catch (e) {
      if (!user) {
        user = await signUp();
        ({ user, status, token } = await login());
      }
    }
  });

  it('should be created user', async () => {
    expect(status).toMatch('ok');

    cleanUserForExpect(user);

    expect(user).toEqual(userRequestData);
  });

  it('should be created graph', async () => {
    ({ data: { status, graphId } } = await getData('graphs/create', graphRequestData));

    expect(status).toMatch('ok');

    expect(graphId).not.toBeNull();
  });

  it('should be created node', async () => {
    ({ data: { status, errors, nodes } } = await getData(`nodes/create/${graphId}`, { nodes: [nodeRequestData] }));

    expect(Array.isArray(nodes)).toBe(true);

    const node = nodes[0];

    cleanNodeForExpect(node);

    expect(status).toMatch('ok');

    expect(errors).toEqual([]);

    expect(node).toEqual(nodeRequestData);
  });

  it('should be deleted node', async () => {
    ({ data: { status } } = await axios.delete(`${REACT_APP_API_URL}nodes/delete/${graphId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { nodes },
      }));

    expect(status).toMatch('ok');
  });

  it('should be deleted graph', async () => {
    ({ data: { status } } = await axios.delete(`${REACT_APP_API_URL}graphs/delete/${graphId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }));

    expect(status).toMatch('ok');
  });
});
