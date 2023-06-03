import { useState, useEffect } from 'react';
/* import { useTotalTracksStat, useTopTenArtistsStat } from '../hooks/useDb'; */
import { TotalTracks, TopTenArtists, Genres } from './StatsComponents';
/* import { AiOutlineTrophy } from 'react-icons'; */
import '../style/Stats.css';

const Stats = () => {
  const [req, setReq] = useState('');

  const handleStatReq = (e) => setReq(e.currentTarget.id);

  return (
    <div className="stats">
      <div className="stats--nav">
        <div className="stat" id="totalTracks" onClick={handleStatReq}>
          <p>Total Tracks</p>
        </div>
        <div className="stat" id="totalAlbums" onClick={handleStatReq}>
          <p>Total Albums</p>
        </div>
        <div className="stat" id="topArtists" onClick={handleStatReq}>
          <p>Top Artists</p>
        </div>
        <div className="stat" id="genres" onClick={handleStatReq}>
          <p>Genres</p>
        </div>
      </div>
      <div className="stats--results">
        {req === 'totalTracks' && <TotalTracks />}
        {req === 'genres' && <Genres />}
        {req === 'topArtists' && <TopTenArtists />}
      </div>
    </div>
  );
};

export default Stats;
