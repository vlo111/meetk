import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import Wrapper from '../../components/Wrapper';
import Header from '../../components/Header';
import { getUserRequest } from '../../store/actions/profile';
import { getFriendsRequest } from '../../store/actions/userFriends';
import { getProfile } from '../../store/selectors/profile';
import { getUserFriendsList } from '../../store/selectors/userFriends';
import AddButton from '../search/addFriend';
import { friendType } from '../../data/friend';
import { getId } from '../../store/selectors/account';

const Profile = React.memo((props) => {
  const { userId } = props.match.params;
  const dispatch = useDispatch();
  const profile = useSelector(getProfile);
  const friends = useSelector(getUserFriendsList);
  // select current user id
  const currentUserId = useSelector(getId);

  useEffect(() => {
    dispatch(getUserRequest(userId));
    dispatch(getFriendsRequest(userId));
  }, [dispatch, getUserRequest]);

  return (
    <Wrapper>
      <Header />
      <div className="profile">
        {profile.id && (
          <>
            <div className="editrect">
              { currentUserId === profile.id && (
              <a className="accountedit" href="/account">
                Edit
              </a>
              )}
            </div>
            <h3 className="profile__title">{`Welcome to ${profile.firstName} ${profile.lastName}'s profile page`}</h3>
            <div className="profile__my">
              <article key={profile.id}>
                <img
                  className="profile__avatar"
                  src={profile.avatar}
                  alt={profile.firstName}
                />
                <div className="profile__user">

                  <div className="profile__user-details">

                    <h1>{`${profile.firstName} ${profile.lastName}`}</h1>
                    <div style={{
                      position: 'absolute', right: '-30%', left: '100%', top: '1px',
                    }}
                    >
                      <AddButton user={profile} />
                    </div>
                    {currentUserId === userId && (
                      <span className="email">
                        <strong>Email : </strong>
                        {profile.email}
                      </span>
                    )}
                    <div>
                      <strong>Website : </strong>
                      <a className="website" href={profile.website} target="_blank" rel="noreferrer">

                        {profile.website}
                      </a>
                    </div>
                    <span className="profile__description">
                      <span>
                        <strong>About : </strong>
                        {profile.bio}
                      </span>
                    </span>

                  </div>
                </div>

              </article>
            </div>
          </>
        )}
        <div className="social-list">
          {profile.facebook && (
          <div className="social-list-facebook">
            <a href={profile.facebook} target=" ">
              {' '}
              <i className="fa fa-facebook-square" />
              {' '}
            </a>
          </div>
          )}

          {profile.twitter && (
          <div className="social-list-twitter">
            <a href={profile.twitter} target=" ">
              <i className="fa fa-twitter" />
            </a>
          </div>
          )}

          {profile.linkedin && (
          <div className="social-list-linkedin">
            <a href={profile.linkedin} target=" ">
              <i className="fa fa-linkedin"> </i>
            </a>
          </div>
          )}
          {profile.skype && (
          <div className="social-list-skype">
            <a href={profile.skype} target=" ">
              <i className="fa fa-skype" />
            </a>
          </div>
          )}
        </div>

        {currentUserId === userId && (
          <div className="profile__friends">
            <h4>Friend requests</h4>
            {friends && friends.length ? (
              friends.map((friendship) => {
                const { senderUser } = friendship;
                const userIsSender = senderUser.id === userId;
                const friend = !userIsSender ? friendship.receiverUser : senderUser;

                return (
                  friendship.status === friendType.pending && (
                    <article key={friend.id} className="searchData__graph">
                      <div className="searchData__graphInfo">
                        <img
                          className="avatar"
                          src={friend.avatar}
                          alt={friend.firstName}
                        />
                        <div className="searchData__graphInfo-details">
                          <Link to={`/profile/${friend.id}`}>
                            {`${friend.firstName} ${friend.lastName}`}
                          </Link>
                        </div>
                      </div>
                      <AddButton user={friend} />
                    </article>
                  )
                );
              })
            ) : null}
          </div>
        )}
      </div>
    </Wrapper>
  );
});

Profile.propTypes = {
  match: PropTypes.object.isRequired,
};

export default withRouter(Profile);
