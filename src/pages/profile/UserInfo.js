import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { getGraphsAndSharegraphsCount } from '../../store/actions/graphs';
import { myFriendsRequest } from '../../store/actions/userFriends';

import { getProfile } from '../../store/selectors/profile';
import { getUserFriendsList, friendsList } from '../../store/selectors/userFriends';
import { getGraphsCount } from '../../store/selectors/graphs';
import { getId } from '../../store/selectors/account';

import AddFriend from '../search/addFriend';
import ImageUploader from '../../components/ImageUploader';

import fcb_img from '../../assets/images/fcb.png';
import twit from '../../assets/images/twit.png';
import linkdein from '../../assets/images/linkdein.png';
import skype from '../../assets/images/skype.png';

const ProfileMain = React.memo(({
  edit, userId, avatar, handleChange,
}) => {
  const dispatch = useDispatch();
  // get profile
  const profile = useSelector(getProfile);
  const myfriends = useSelector(friendsList);
  const userFriendsList = edit ? myfriends : useSelector(getUserFriendsList);
  const friends = userFriendsList.filter((friend) => (friend.status == 'accepted'));
  // graphs and share graphs
  const allGraphsCount = useSelector(getGraphsCount);
  // select current user id
  const currentUserId = useSelector(getId);
  // check user is friend or not
  let isFriend = false;
  if (userId && userFriendsList.length) {
    if (currentUserId === userId) {
      isFriend = true;
    } else {
      for (const friend of myfriends) {
        if (userId == friend.friendUserId && friend.status == 'accepted') {
          isFriend = true;
          break;
        }
      }
    }
  }

  if (userId && currentUserId == userId) {
    isFriend = true;
  } else {
    for (const friend of userFriendsList) {
      if (userId == friend.friendUserId && friend.status == 'accepted') {
        isFriend = true;
        break;
      }
    }
  }

  useEffect(() => {
    if (isFriend) {
      dispatch(getGraphsAndSharegraphsCount(userId));
    }

    if (!myfriends.length) {
      dispatch(myFriendsRequest());
    }
  }, [dispatch, getGraphsAndSharegraphsCount, userId]);

  return (
    <>
      {profile.id && (
        <>
          <div className="colm-sm-6 section1">
            <div className="profile_desc">
              <div className="img">
                {edit ? (
                  <ImageUploader
                    value={avatar || profile.avatar}
                    email={profile.email}
                    onChange={(val) => handleChange(val || '', 'avatar')}
                  />
                ) : <img src={profile.avatar} alt="" />}
              </div>
              <h1>{`${profile.firstName} ${profile.lastName}`}</h1>
              <div className="profile_address text-size-16">
                {currentUserId === userId && (<div>{profile.email}</div>)}
                {/* <div>{profile.address ? profile.address : 'Armenia, yerevan'}</div> */}
                <div>{profile.phone}</div>
              </div>
              <p className="text-size-16 account_description">
                {profile.bio}
              </p>
            </div>

            {isFriend && (
            <div className="row_ profile_info user_prf_color1 fw-bold">
              <div className="colm">
                <div className="number text-size-50">{friends.length}</div>
                <div className="text">Friends</div>
              </div>
              <div className="colm">
                <div className="number text-size-50">{allGraphsCount?.totalGraphs}</div>
                <div className="text">Graphs</div>
              </div>
              <div className="colm">
                <div className="number text-size-50">{allGraphsCount?.totalShareGraphs}</div>
                <div className="text">Share Graphs</div>
              </div>
            </div>
            )}

          </div>

          {!edit && (
          <div className="colm-sm-6 section2">
            {currentUserId !== userId && (
            <AddFriend user={profile} />
            )}
            <div className="edit_profile">
              <div>User Details</div>
              {currentUserId === profile.id && (
              <a className="accountedit user_prf_color1" href="/account">
                Edit Profile
              </a>
              )}
            </div>
            {currentUserId === profile.id && (
            <div className="user_address_info email">
              <h1>Email Address</h1>
              <p className="user_prf_color1">{profile.email}</p>
            </div>
            )}
            {profile.country && (
            <div className="user_address_info">
              <h1>Country</h1>
              <p>{profile.country}</p>
            </div>
            )}
            {profile.city && (
            <div className="user_address_info">
              <h1>City/ Town</h1>
              <p>{profile.city}</p>
            </div>
            )}

            <div className="user_address_info">
              <h1>Social</h1>
              <div className="social-img d-flex">
                {profile.facebook && (
                <a href={profile.facebook} target=" ">
                  <img src={fcb_img} alt="" />
                </a>
                )}

                {profile.twitter && (
                <a href={profile.twitter} target=" ">
                  <img src={twit} alt="" />
                </a>
                )}
                {profile.linkedin && (
                <a href={profile.linkedin} target=" ">
                  <img src={linkdein} alt="" />
                </a>
                )}
                {profile.skype && (
                <a href={profile.skype} target=" ">
                  <img src={skype} alt="" />
                </a>
                )}

              </div>
            </div>
            {/* <div className="user_address_info">
<h1>Interest</h1>
<div className="interest">
<div>Natuer</div>
<div>Winemaking</div>
<div>Plants</div>
</div>

</div> */}
          </div>

          )}

        </>
      )}
    </>
  );
});

export default ProfileMain;
