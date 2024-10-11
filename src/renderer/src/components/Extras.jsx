import { useAudioPlayer } from '../AudioPlayerContext';
import { CgMiniPlayer } from 'react-icons/cg';
import { CiStop1 } from 'react-icons/ci';
import '../style/Extras.css';

const Extras = ({ handlePlayerControls }) => {
  const { state, dispatch } = useAudioPlayer();
  return (
    <ul className="extras">
      <li className="btn" id="stop" onClick={handlePlayerControls}>
        <CiStop1 />
      </li>
      <li className="btn" id="miniplayer" onClick={handlePlayerControls}>
        <CgMiniPlayer />
      </li>
      <li className={state.library ? 'library on' : 'library off'}>
        <p>library</p>
      </li>
      <li className={state.playlistShuffle || state.tracksShuffle ? 'shuffle on' : 'shuffle off'}>
        <p>shuffle</p>
      </li>
      {state.volume ? (
        <li className="volume on">
          <p>{state.volume}</p>
        </li>
      ) : (
        <li className="volume off">
          <p>{state.volume}</p>
        </li>
      )}
      <li className={state.seeking ? 'seeking on' : 'seeking off'}>
        <p>seeking</p>
      </li>
    </ul>
  );
};

export default Extras;
