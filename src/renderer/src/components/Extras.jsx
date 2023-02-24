import { CgMiniPlayer } from 'react-icons/cg';
import '../style/Extras.css';

const Extras = ({ handlePlayerControls, library, shuffle, volume, seeking, home }) => {
  return (
    <ul className="extras">
      <li className="btn" id="miniplayer" onClick={handlePlayerControls}>
        <CgMiniPlayer />
      </li>
      <li className={library ? 'library on' : 'library off'}>
        <p>library</p>
      </li>
      <li className={shuffle ? 'shuffle on' : 'shuffle off'}>
        <p>shuffle</p>
      </li>
      {volume ? (
        <li className="volume on">
          <p>{volume}</p>
        </li>
      ) : (
        <li className="volume off">
          <p>{volume}</p>
        </li>
      )}
      <li className={seeking ? 'seeking on' : 'seeking off'}>
        <p>seeking</p>
      </li>
    </ul>
  );
};

export default Extras;
