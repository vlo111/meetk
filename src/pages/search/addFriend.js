import React, {
  useMemo, useCallback,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import find from 'lodash/find';
import { getId } from '../../store/selectors/account';
import Button from '../../components/form/Button';
import Select from '../../components/form/Select';
import {
  AddFriendRequest, removeFriendRequest, acceptFriendRequest,
} from '../../store/actions/userFriends';
import { friendsList } from '../../store/selectors/userFriends';
import { ReactComponent as PlusFriendsSvg } from '../../assets/images/icons/friend-plus.svg';
import { ReactComponent as SolidFriendsSvg } from '../../assets/images/icons/user-solid.svg';

const selectOptions = [
  { value: 'accept', label: 'Accept' },
  { value: 'reject', label: 'Reject' },
];

const AddFriend = React.memo(({ user }) => {
  const { id } = user;
  const dispatch = useDispatch();
  const loggedInUserId = useSelector(getId);
  const myFriends = useSelector(friendsList);

  const selectAction = useCallback(
    async (action, actionUserId) => {
      if (action.value === 'accept') {
        await dispatch(acceptFriendRequest({ receiverUserId: id }, actionUserId));
      } else {
        await dispatch(removeFriendRequest(actionUserId));
      }
    },
    [dispatch],
  );

  const getButtonClick = useMemo(() => {
    const matchUser = find(myFriends, (it) => it.friendUserId === id);
    if (matchUser) {
      switch (matchUser.status) {
        case 'pending':
          if (matchUser.isSender) {
            return (
              <Button
                className="ghButton2"
                icon={<SolidFriendsSvg />}
                onClick={() => dispatch(removeFriendRequest(matchUser.id))}
              >
                Cancel Request
              </Button>
            );
          }
          return (
            <Select
              containerId="request_wrapper"
              options={selectOptions}
              onChange={(action) => selectAction(action, matchUser.id)}
              placeholder="Request"
            />
          );
        case 'accepted':
          return (
            <Button
              className="ghButton2"
              icon={<SolidFriendsSvg />}
              onClick={() => dispatch(removeFriendRequest(matchUser.id))}
            >
              <span>Unfriend </span>
            </Button>
          );
        case 'rejected':
          return (
            <Button
              className="ghButton2"
              icon={<PlusFriendsSvg />}
              onClick={() => dispatch(AddFriendRequest({ receiverUserId: id }))}
            >
              Add Friend
            </Button>
          );
        default:
          return (
            <Button
              className="ghButton2"
              icon={<PlusFriendsSvg />}
              onClick={() => dispatch(AddFriendRequest({ receiverUserId: id }))}
            >
              Add Friend
            </Button>
          );
      }
    }

    return (
      <Button
        className="ghButton2"
        icon={<PlusFriendsSvg />}
        onClick={() => dispatch(AddFriendRequest({ receiverUserId: id }))}
      >
        Add Friend
      </Button>
    );
  }, [dispatch, selectAction, myFriends, id]);

  return loggedInUserId !== id ? getButtonClick : null;
});

AddFriend.propTypes = {
  user: PropTypes.object.isRequired,
};

export default React.memo(AddFriend);
