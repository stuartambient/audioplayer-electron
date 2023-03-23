import { useState, useEffect } from 'react';
import { GiMagnifyingGlass } from 'react-icons/gi';
import Stats from './Stats';
import Playlists from './Playlists';
/* import AppState from '../hooks/AppState'; */
import '../style/Home.css';
import AlbumsCoverView from './AlbumsCoverView';
import Player from './Player';
import CoverSearch from './CoverSearch';

const Home = ({ state, dispatch }) => {
  const [homepage, setHomePage] = useState('albums-cover-view');
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
    dispatch({
      type: 'reset-albums-covers',
      covers: [],
      coversPageNumber: 0
    });
    console.log('search term: ', coversSearchTerm);
  };
  return (
    <>
      <ul className="home-cards" style={{ color: 'white' }}>
        <li
          className={
            homepage === 'albums-cover-view' ? 'home-cards--item active' : 'home-cards--item'
          }
          id="albums-cover-view"
          onClick={handleHomePage}
        >
          <span>Albums with Cover View</span>
        </li>
        {/* <li className="covers-search"></li> */}
        {homepage === 'albums-cover-view' && (
          <li className="covers-search-form">
            <input
              className={
                homepage === 'albums-cover-view' ? 'search-covers search-active' : 'search-covers'
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

      {homepage === 'albums-cover-view' && (
        <AlbumsCoverView
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
