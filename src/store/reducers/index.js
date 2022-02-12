import { combineReducers } from 'redux';
import app from './app';
import account from './account';
import graphs from './graphs';
import shareGraphs from './shareGraphs';
import commentGraphs from './commentGraphs';
import notifications from './notifications';
import userFriends from './userFriends';
import graphLabelsEmbed from './graphLabelsEmbed';
import profile from './profile';
import commentNodes from './commentNodes';
import share from './share';
import document from './document';
import graphsHistory from './graphsHistory';
import likeGraphs from './likeGraphs';

export default combineReducers({
  app,
  account,
  graphs,
  shareGraphs,
  commentGraphs,
  notifications,
  userFriends,
  profile,
  graphLabelsEmbed,
  commentNodes,
  share,
  document,
  graphsHistory,
  likeGraphs,
});
