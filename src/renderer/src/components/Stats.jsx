import { useState, useEffect } from 'react';
/* import { useTotalTracksStat, useTopTenArtistsStat } from '../hooks/useDb'; */
import { TotalMedia, TopTenArtists, Genres, NullMetadata } from './StatsComponents';
/* import { AiOutlineTrophy } from 'react-icons'; */
import '../style/Stats.css';

const Stats = () => {
  const [req, setReq] = useState('');

  const handleStatReq = (e) => setReq(e.currentTarget.id);

  return (
    <div className="stats">
      <ul className="stats--nav">
        <li className="stat" id="totalmedia" onClick={handleStatReq}>
          <p>Total media</p>
        </li>
        <li className="stat" id="topArtists" onClick={handleStatReq}>
          <p>Top Artists</p>
        </li>
        <li className="stat" id="genres" onClick={handleStatReq}>
          <p>Genres</p>
        </li>
        <li className="stat" id="nometadata" onClick={handleStatReq}>
          <p>Missing metadata</p>
        </li>
      </ul>
      <div className="stats--results">
        {req === 'totalmedia' && <TotalMedia />}
        {req === 'genres' && <Genres />}
        {req === 'topArtists' && <TopTenArtists />}
        {req === 'nometadata' && <NullMetadata />}
      </div>
    </div>
  );
};

export default Stats;
