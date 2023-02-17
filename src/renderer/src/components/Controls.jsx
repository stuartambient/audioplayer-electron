import { FaHeart, FaBackward, FaForward, FaListUl } from 'react-icons/fa';
import { GiPauseButton, GiPlayButton } from 'react-icons/gi';
import '../style/Controls.css';

const Controls = ({ isLiked, handlePlayerControls, pause, minimalmode, player, home }) => {
  const controlsClassNames = () => {
    if (player && !minimalmode) {
      return 'controls';
    }
    if (minimalmode) {
      return 'controls controls--minimalmode';
    }
    if (home) {
      return 'controls controls-home';
    }
  };
  return (
    <ul className={controlsClassNames()}>
      <li className={isLiked ? 'btn isliked' : 'btn'} id="like" onClick={handlePlayerControls}>
        <FaHeart />
      </li>

      {pause ? (
        <li className="btn" id="pauseplay" onClick={handlePlayerControls}>
          <GiPlayButton />
        </li>
      ) : (
        <li className="btn" id="pauseplay" onClick={handlePlayerControls}>
          <GiPauseButton />
        </li>
      )}
      <li className="btn" id="backward" onClick={handlePlayerControls}>
        <FaBackward />
      </li>

      <li className="btn" id="forward" onClick={handlePlayerControls}>
        <FaForward />
      </li>
      {!minimalmode && (
        <li className="btn" id="playlist" onClick={handlePlayerControls}>
          <FaListUl />
        </li>
      )}
    </ul>
  );
};

export default Controls;
