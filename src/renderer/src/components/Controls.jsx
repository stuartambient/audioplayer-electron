import { useAudioPlayer } from '../AudioPlayerContext';
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
  const { state, dispatch } = useAudioPlayer();
  const controlsClassNames = () => {
    if (state.player && !state.minimalmode) {
      return 'controls';
    }
    if (state.minimalmode) {
      return 'controls controls--minimalmode';
    }
    if (state.home) {
      return 'controls controls-home';
    }
  };

  const shuffleButtonClassName = () => {
    if (state.tracksShuffle && state.listType === 'files') {
      return 'btn on';
    }
    if (state.playlistShuffle && state.listType === 'playlist') {
      return 'btn plshuffle';
    } else {
      return 'btn';
    }
  };
  return (
    <ul className={controlsClassNames()}>
      <li
        className={state.isLiked ? 'btn isliked' : 'btn'}
        id="like"
        onClick={handlePlayerControls}
      >
        <FaHeart />
      </li>

      {state.pause ? (
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
      {!state.minimalmode && !state.home && (
        <li
          className={state.library ? 'btn on' : 'btn'}
          id="playlist"
          onClick={handlePlayerControls}
        >
          <FaListUl />
        </li>
      )}
    </ul>
  );
};

export default Controls;
