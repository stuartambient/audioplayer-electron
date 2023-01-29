import { useState, useEffect } from 'react';
import Stats from './Stats';
import '../style/Home.css';
import RecentAdditions from './RecentAdditions';

const Home = () => {
  const [homepage, setHomePage] = useState('recent-additions');

  const handleHomePage = (e) => {
    setHomePage(e.currentTarget.id);
  };
  return (
    <>
      <ul className="home-cards" style={{ color: 'white' }}>
        <li className="home-cards--item" id="recent-additions" onClick={handleHomePage}>
          <h3>Recent additions</h3>
        </li>
        <li className="home-cards--item" id="stats" onClick={handleHomePage}>
          <h3>Stats</h3>
          {/* <Stats /> */}
        </li>
        <li className="home-cards--item" id="playlists" onClick={handleHomePage}>
          <h3>Playlists</h3>
        </li>
        <li className="home-cards--item" id="genres" onClick={handleHomePage}>
          <h3>Genres</h3>
        </li>
        <li className="home-cards--item">5</li>
        <li className="home-cards--item">6</li>
      </ul>
      {homepage === 'recent-additions' && <RecentAdditions />}
      {homepage === 'stats' && <Stats />}
    </>
  );
};

export default Home;
