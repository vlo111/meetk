import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import moment from 'moment';
import Carousel from 'react-bootstrap/Carousel';
import Wrapper from '../../components/Wrapper';
import Header from '../../components/Header';
import { getUserRequest } from '../../store/actions/profile';
import { getFriendsRequest } from '../../store/actions/userFriends';
import { getProfile } from '../../store/selectors/profile';
import { getUserFriendsList } from '../../store/selectors/userFriends';
import { getId } from '../../store/selectors/account';
import AddFriend from '../search/addFriend';
import Button from '../../components/form/Button';
import { friendType } from '../../data/friend';
import UserInfo from '../profile/UserInfo';
import Popover from '../../components/form/Popover';

const Profile = React.memo((props) => {
  const { userId } = props.match.params;
  const dispatch = useDispatch();
  const profile = useSelector(getProfile);
  const friends = useSelector(getUserFriendsList);
  const friendsConfirmList = [];
  const friendsRequests = [];
  const frindsItemForSlide = [];

  // define count of friend slide depends on window size
  const { innerWidth: width } = window;
  const eachCountsSlideItem = (width >= 768) ? 6 : 3;

  // select current user id
  const currentUserId = useSelector(getId);

  if (currentUserId === profile.id) {
    for (const friend of friends) {
      if (friend.status == friendType.accepted) {
        friendsConfirmList.push(friend);
      } else if (friend.status == friendType.pending) {
        friendsRequests.push(friend);
      }
    }

    for (let i = 0; i < friendsRequests.length; i += eachCountsSlideItem) {
      frindsItemForSlide.push(friendsRequests.slice(i, i + eachCountsSlideItem));
    }
  }

  useEffect(() => {
    dispatch(getUserRequest(userId));
    dispatch(getFriendsRequest(userId));
  }, [dispatch, getUserRequest, userId]);

  return (
    <Wrapper className="accountPage">
      <Header />
      <div className="profile newVersion">
        <div className="row_">
          <UserInfo userId={userId} />
        </div>
        {currentUserId === userId && (
          <>
            {frindsItemForSlide.length > 0 && (
              <div className="friends-requests row_">
                <div className="colm-md-6 d-flex">
                  <span>Friend Requests </span>
                  <span style={{ width: '90px', height: '10px' }} />
                </div>
                <Carousel interval={null} indicators={frindsItemForSlide.length > 1} controls={frindsItemForSlide.length > 1}>
                  {frindsItemForSlide.map((item, i) => (
                    <Carousel.Item key={i}>
                      {
                        item.map((friendship, i) => {
                          const { senderUser, receiverUser } = friendship;
                          const userIsSender = senderUser.id === userId;
                          const friend = !userIsSender ? friendship.senderUser : receiverUser;
                          return (
                            <div className="d-flex friend_box" key={i}>
                              <div>
                                <div className="img_box">
                                  <img
                                    className="w-100"
                                    src={friend.avatar}
                                    alt="First slide"
                                  />
                                </div>

                                <div>

                                  <Link to={`/profile/${friend.id}`}>
                                    <h6>
                                      {`${friend.firstName} ${friend.lastName}`}
                                    </h6>
                                  </Link>

                                  <p>{moment(friend.updatedAt).calendar()}</p>
                                </div>

                              </div>
                              <AddFriend user={friend} />
                            </div>
                          );
                        })
                      }
                    </Carousel.Item>

                  ))}

                </Carousel>
              </div>
            )}

            {friendsConfirmList.length > 0 && (
              <div className="row_ friends">
                <div className="colm-12 fw-bold">Friends</div>
                {
                  friendsConfirmList.map((friendship, j) => {
                    const { senderUser, receiverUser } = friendship;
                    const userIsReceiver = receiverUser.id === userId;
                    const friend = !userIsReceiver ? receiverUser : senderUser;
                    return (
                      <div className="colm-md-4 colm-sm-6 friend_box " key={j}>
                        <div>
                          <div className="img_box">
                            <img
                              src={friend.avatar}
                              alt="First slide"
                            />
                          </div>

                          <div className="friendname text-size-16">
                            <Link to={`/profile/${friend.id}`}>
                              <h6>
                                {`${friend.firstName} ${friend.lastName}`}
                              </h6>
                            </Link>

                            <p>{moment(friend.updatedAt).calendar()}</p>
                          </div>

                        </div>
                        <div className="friend-unfriend">
                          <Popover
                            triggerNode={(
                              <Button className="btn-link d-flex" type="submit">Friend</Button>
                                  )}
                            trigger="click"
                          >
                            <div
                              className="unfriend"
                            >
                              <div>
                                <AddFriend user={friend} />
                              </div>
                            </div>
                          </Popover>
                        </div>

                      </div>

                    );
                  })
                }

              </div>

            )}

          </>
        )}

      </div>

    </Wrapper>
  );
});

Profile.propTypes = {
  match: PropTypes.object.isRequired,
};

export default withRouter(Profile);
