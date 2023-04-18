import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
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
  const [resetKey, setResetKey] = useState('');
  /*   const { state, dispatch } = AppState(); */
  const getKey = () => uuidv4();

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
    e.preventDefault();
    if (!coverSearchRef.current.value) {
      setResetKey(getKey());
    }
    console.log(coverSearchRef.current.value);
    dispatch({
      type: 'covers-search-term',
      coversSearchTerm: coverSearchRef.current.value,
      covers: [],
      coversPageNumber: 0
    });
  };

  const coverSearchRef = useRef();
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
            <form onSubmit={handleCoversSearchTerm} className="covers-search-form">
              <input
                className={
                  homepage === 'albums-cover-view' ? 'search-covers search-active' : 'search-covers'
                }
                id="covers-search-term"
                name="covers-search-term"
                ref={coverSearchRef}
                placeholder="search covers"
                /*  value={state.coversSearchTerm}
              onChange={handleCoversSearchTerm} */
              />
              <button value="Submit">
                <GiMagnifyingGlass />
              </button>
            </form>
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
          resetKey={resetKey}
          homepage={homepage}
          coversLoaded={state.coversLoaded}
        />
      )}
      {homepage === 'stats' && <Stats />}
      {homepage === 'playlists' && <Playlists />}
      {homepage === 'coversearch' && <CoverSearch />}
    </>
  );
};

export default Home;
