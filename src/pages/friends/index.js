import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Wrapper from '../../components/Wrapper';
import { getUserFriendsList } from '../../store/selectors/userFriends';
import { getFriendsRequest, myFriendsRequest } from '../../store/actions/userFriends';
import { getId } from '../../store/selectors/account';
import AddButton from '../search/addFriend';

const Friends = React.memo(() => {
  const dispatch = useDispatch();
  const friends = useSelector(getUserFriendsList);
  const userId = useSelector(getId);

  useEffect(() => {
    dispatch(myFriendsRequest());
  }, [dispatch, myFriendsRequest]);

  useEffect(() => {
    dispatch(getFriendsRequest());
  }, [dispatch]);

  return (
    <Wrapper>
      <>
        {friends && friends.length ? (
          friends.map((friendship) => {
            const { senderUser } = friendship;
            const userIsSender = senderUser.id === userId;
            const friend = !userIsSender ? senderUser : friendship.receiverUser;

            return (
              <>
                <div className="homPageHeader">
                  <div><p>Friends</p></div>
                </div>
                <div key={friend.id} className="usersCard">
                  <div className="users">
                    <div className="friend_image_content">
                      <img
                        className="avatar"
                        src={friend.avatar}
                        alt={friend.firstName}
                      />
                    </div>
                    <div className="friend_buttons_content">
                      <Link to={`/profile/${friend.id}`}>
                        {`${friend.firstName} ${friend.lastName}`}
                      </Link>
                      <AddButton user={friend} />
                    </div>
                  </div>
                </div>
              </>
            );
          })
        ) : (
          <div className="homPageHeader">
            <div><p>Friends</p></div>
          </div>
        )}
      </>
    </Wrapper>
  );
});

export default Friends;
