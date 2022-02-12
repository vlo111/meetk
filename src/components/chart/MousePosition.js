import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { socketMousePosition } from '../../store/actions/socket';
import { getId } from '../../store/selectors/account';
import ChartUtils from '../../helpers/ChartUtils';

const MousePosition = ({ graphId }) => {
  const [mousePosition, setMousePosition] = useState({ x: null, y: null });
  const dispatch = useDispatch();
  const userId = useSelector(getId);
  useEffect(
    () => {
      const update = (e) => {
        const { x, y } = ChartUtils.calcScaledPosition(e.x, e.y);
        setMousePosition({ x, y });
      };
      window.addEventListener('mousemove', update);
      window.addEventListener('touchmove', update);
      return () => {
        window.removeEventListener('mousemove', update);
        window.removeEventListener('touchmove', update);
      };
    },
    [setMousePosition],
  );
  dispatch(socketMousePosition(graphId, userId, mousePosition));
  return setMousePosition;
};

export default MousePosition;
