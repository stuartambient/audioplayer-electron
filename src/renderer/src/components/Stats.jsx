import { useState, useEffect } from 'react';
import { useTotalTracksStat, useTopTenArtistsStat } from '../hooks/useDb';
/* import { AiOutlineTrophy } from 'react-icons'; */
import '../style/Stats.css';

const Stats = () => {
  /* const { totalTracks } = shouldCallHook ? useTotalTracksStat() : {};  */
  const [callHook, setCallHook] = useState(false);
  const { totalTracks } = useTotalTracksStat();
  const { topTenArtists } = useTopTenArtistsStat();
  console.log('topTenArtists: ', topTenArtists);

  const handleStatReq = (e) => {
    console.log('stat req: ', e.target.id);
    console.log('or ct: ', e.currentTarget.id);
  };

  return (
    <div className="stats">
      <ul className="stats-quick-stats">
        <li className="stats-total-tracks" id="totalTracks" onClick={handleStatReq}>
          <span className="stats-label">Total tracks:</span>
          {totalTracks}
        </li>
        <li className="stats-total-albums">
          <span className="stats-label">
            {' '}
            {/* <AiOutlineTrophy /> */}
            Total albums:
          </span>
        </li>
      </ul>
      <ul className="stats-top10artists" style={{ color: 'white' }}>
        <span className="stats-label">Top ten artists:</span>
        {topTenArtists.map((tta) => {
          return (
            <li className="stats-top10artist">
              {tta.artist} # of tracks: {tta['COUNT(*)']}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Stats;
