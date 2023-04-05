import { FaHeart, FaBackward, FaForward, FaListUl, FaRandom } from 'react-icons/fa';
import { GiPauseButton, GiPlayButton } from 'react-icons/gi';
import '../style/Controls.css';

const Controls = ({
  isLiked,
  handlePlayerControls,
  pause,
  minimalmode,
  player,
  home,
  library,
  tracksShuffle,
  playlistShuffle,
  listType
}) => {
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

  const shuffleButtonClassName = () => {
    if (tracksShuffle && listType === 'files') {
      return 'btn on';
    }
    if (playlistShuffle && listType === 'playlist') {
      return 'btn plshuffle';
    } else {
      return 'btn';
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
      <li className={shuffleButtonClassName()} id="shuffle" onClick={handlePlayerControls}>
        <FaRandom />
      </li>
      {!minimalmode && !home && (
        <li className={library ? 'btn on' : 'btn'} id="playlist" onClick={handlePlayerControls}>
          <FaListUl />
        </li>
      )}
    </ul>
  );
};

export default Controls;
