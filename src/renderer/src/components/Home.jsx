import { useState, useEffect } from 'react';
import Stats from './Stats';
import Playlists from './Playlists';
/* import AppState from '../hooks/AppState'; */
import '../style/Home.css';
import RecentAdditions from './RecentAdditions';
import Player from './Player';

const Home = ({ state, dispatch }) => {
  const [homepage, setHomePage] = useState('recent-additions');
  /*   const { state, dispatch } = AppState(); */

  const handleHomePage = (e) => {
    setHomePage(e.currentTarget.id);
  };
  return (
    <>
      <ul className="home-cards" style={{ color: 'white' }}>
        <li className="home-cards--item" id="recent-additions" onClick={handleHomePage}>
          <h5>Recent additions</h5>
        </li>
        <li className="home-cards--item" id="stats" onClick={handleHomePage}>
          <h5>Stats</h5>
          {/* <Stats /> */}
        </li>
        <li className="home-cards--item" id="playlists" onClick={handleHomePage}>
          <h5>Playlists</h5>
        </li>
        <li className="home-cards--item" id="genres" onClick={handleHomePage}>
          <h5>Genres</h5>
        </li>
        <li className="home-cards--item">5</li>
        <li className="home-cards--item">6</li>
      </ul>

      {homepage === 'recent-additions' && (
        <RecentAdditions
          state={state}
          dispatch={dispatch}
          covers={state.covers}
          coversPageNumber={state.coversPageNumber}
        />
      )}
      {homepage === 'stats' && <Stats />}
      {homepage === 'playlists' && <Playlists />}
    </>
  );
};

export default Home;
