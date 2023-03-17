import { useState, useEffect } from 'react';
import { GiMagnifyingGlass } from 'react-icons/gi';
import Stats from './Stats';
import Playlists from './Playlists';
/* import AppState from '../hooks/AppState'; */
import '../style/Home.css';
import RecentAdditions from './RecentAdditions';
import Player from './Player';
import CoverSearch from './CoverSearch';

const Home = ({ state, dispatch }) => {
  const [homepage, setHomePage] = useState('recent-additions');
  /*   const { state, dispatch } = AppState(); */

  const handleHomePage = (e) => {
    setHomePage(e.currentTarget.id);
    /* if (e.currentTarget.id === 'recent-additions') {
      dispatch({
        type: 'reset-albums-covers',
        covers: [],
        coversPageNumber: undefined
      });
    } */
  };

  const handleCoversSearchTerm = (e) => {
    dispatch({
      type: 'covers-search-term',
      coversSearchTerm: e.target.value
    });
  };

  const handleSearchTerm = (e) => {
    if (state.coversSearchTerm === '') {
      dispatch({
        type: 'reset-albums-covers',
        covers: [],
        coversPageNumber: undefined
      });
    } else {
      dispatch({
        type: 'reset-albums-covers',
        covers: [],
        coversPageNumber: 0
      });
    }
  };
  return (
    <>
      <ul className="home-cards" style={{ color: 'white' }}>
        <li
          className={
            homepage === 'recent-additions' ? 'home-cards--item active' : 'home-cards--item'
          }
          id="recent-additions"
          onClick={handleHomePage}
        >
          <span>Recent additions</span>
        </li>
        {/* <li className="covers-search"></li> */}
        {homepage === 'recent-additions' && (
          <li className="covers-search-form">
            <input
              className={
                homepage === 'recent-additions' ? 'search-covers search-active' : 'search-covers'
              }
              id="search-covers"
              placeholder="search covers"
              value={state.coversSearchTerm}
              onChange={handleCoversSearchTerm}
            />
            <GiMagnifyingGlass onClick={handleSearchTerm} />
          </li>
        )}
        <li
          className={homepage === 'stats' ? 'home-cards--item active' : 'home-cards--item'}
          id="stats"
          onClick={handleHomePage}
        >
          <span>Stats</span>
          {/* <Stats /> */}
        </li>
        <li
          className={homepage === 'playlists' ? 'home-cards--item active' : 'home-cards--item'}
          id="playlists"
          onClick={handleHomePage}
        >
          <span>Playlists</span>
        </li>
        <li
          className={homepage === 'coversearch' ? 'home-cards--item active' : 'home-cards--item'}
          id="coversearch"
          onClick={handleHomePage}
        >
          <span>Cover search</span>
        </li>
      </ul>

      {homepage === 'recent-additions' && (
        <RecentAdditions
          state={state}
          dispatch={dispatch}
          covers={state.covers}
          coversPageNumber={state.coversPageNumber}
          coversSearchTerm={state.coversSearchTerm}
        />
      )}
      {homepage === 'stats' && <Stats />}
      {homepage === 'playlists' && <Playlists />}
      {homepage === 'coversearch' && <CoverSearch />}
    </>
  );
};

export default Home;
