import { useState, useEffect } from 'react';
/* import { useTotalTracksStat, useTopTenArtistsStat } from '../hooks/useDb'; */
import { TotalTracks, TopTenArtists } from './StatsComponents';
/* import { AiOutlineTrophy } from 'react-icons'; */
import '../style/Stats.css';

const Stats = () => {
  const [req, setReq] = useState('');

  const handleStatReq = (e) => setReq(e.currentTarget.id);

  return (
    <div className="stats">
      <div className="stat" id="totalTracks" onClick={handleStatReq}>
        <p>Total Tracks</p>
        {req === 'totalTracks' && <TotalTracks />}
      </div>
      <div className="stat" id="totalAlbums" onClick={handleStatReq}>
        <p>Total Albums</p>
      </div>
      <div className="stat" id="topArtists" onClick={handleStatReq}>
        <p>Top Artists</p>
        {req === 'topArtists' && <TopTenArtists />}
      </div>
      <div className="stat" id="genres" onClick={handleStatReq}>
        <p>Genres</p>
      </div>
    </div>
  );
};

export default Stats;
