import { useState, useEffect } from 'react';
/* import { useTotalTracksStat, useTopHundredArtistsStat } from '../hooks/useDb'; */
import { TotalMedia, TopHundredArtists, Genres, NullMetadata } from './StatsComponents';
/* import { AiOutlineTrophy } from 'react-icons'; */
import '../style/Stats.css';

const Stats = () => {
  const [req, setReq] = useState('');
  const [sort, setSort] = useState('col1');

  const handleStatReq = (e) => setReq(e.currentTarget.id);

  const handleSort = (e) => {
    console.log(e.target.id);
  };

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
        {req === 'genres' && (
          <>
            <div className="stats--sort">
              <p id="col1sort" onClick={handleSort}>
                sort1
              </p>
              <p id="col2sort" onClick={handleSort}>
                sort2
              </p>
            </div>
            <Genres />
          </>
        )}
        {req === 'topArtists' && (
          <>
            <div className="stats--sort">
              <p id="col1sort" onClick={handleSort}>
                sort1
              </p>
              <p id="col2sort" onClick={handleSort}>
                sort2
              </p>
            </div>
            <TopHundredArtists />
          </>
        )}
        {req === 'nometadata' && <NullMetadata />}
      </div>
    </div>
  );
};

export default Stats;
