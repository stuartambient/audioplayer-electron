import { useState, useRef, useEffect } from 'react';
import { useAudioPlayer } from '../AudioPlayerContext';
import { v4 as uuidv4 } from 'uuid';
import { GiMagnifyingGlass } from 'react-icons/gi';
import { AiFillDownSquare } from 'react-icons/ai';
import { IoIosAlbums } from 'react-icons/io';
import { FaTags } from 'react-icons/fa';
import { PiPlaylistLight } from 'react-icons/pi';
import { GrDocumentMissing } from 'react-icons/gr';
import { IoIosRefresh } from 'react-icons/io';
import Stats from './Stats';
import Playlists from './Playlists';
/* import AppState from '../hooks/AppState'; */
import '../style/Home.css';
import AlbumsCoverView from './AlbumsCoverView';
import Player from './Player';
/* import CoverSearch from './CoverSearch'; */

const Home = () => {
  const { state, dispatch } = useAudioPlayer();
  const [homepage, setHomePage] = useState('albums-cover-view');
  const [resetKey, setResetKey] = useState('');
  const [coversSortOrder, setCoversSortOrder] = useState('DESC');
  const [coverSize, setCoverSize] = useState(1);
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

  const handleCoverSize = (e) => {
    /* console.log('range: ', e.target.value); */
    setCoverSize(Number(e.target.value));
  };

  const handleCoversSort = (e) => {
    e.preventDefault();
    console.log('handleCoversSort: ', e.currentTarget.id);
    if (e.currentTarget.id === 'desc') {
      setCoversSortOrder('DESC');
      dispatch({
        type: 'covers-date-sort',
        coversDateSort: 'DESC',
        covers: [],
        coversPageNumber: 0
      });
    } else if (e.currentTarget.id === 'asc') {
      setCoversSortOrder('ASC');
      dispatch({
        type: 'covers-date-sort',
        coversDateSort: 'ASC',
        covers: [],
        coversPageNumber: 0
      });
    } else return;
  };

  const handleMissingCoversRequest = (e) => {
    e.preventDefault();

    dispatch({
      type: 'covers-missing-request',
      coversMissingReq: 'missing-covers',
      covers: [],
      coversPageNumber: 0
    });
  };

  const handleCoversSearchTerm = (e) => {
    e.preventDefault();
    /*     if (!coverSearchRef.current.value) {
      setResetKey(getKey());
    } */
    dispatch({
      type: 'covers-search-term',
      coversSearchTerm: coverSearchRef.current.value,
      covers: [],
      coversPageNumber: 0
    });
  };

  const handleCoversRefresh = (e) => {
    console.log(e.currentTarget.id);
    setCoversSortOrder('DESC');
    coverSearchRef.current.value = '';
    dispatch({
      type: 'covers-refresh',
      coversMissingReq: 'not-requested',
      covers: [],
      coversPageNumber: 0,
      coversSearchTerm: '',
      coversDateSort: 'DESC'
    });
  };

  const coverSearchRef = useRef();
  return (
    <>
      <ul className="home-cards" style={{ color: 'white' }}>
        {/*  <li
          className={
            homepage === 'albums-cover-view' ? 'home-cards--item active' : 'home-cards--item'
          }
          id="albums-cover-view"
          onClick={handleHomePage}
        ></li> */}
        {/* <li className="covers-search"></li> */}
        {homepage === 'albums-cover-view' && (
          <>
            <li className="covers-search-form">
              <form onSubmit={handleCoversSearchTerm} className="covers-search-form">
                <input
                  className={
                    homepage === 'albums-cover-view'
                      ? 'search-covers search-active'
                      : 'search-covers'
                  }
                  id="covers-search-term"
                  name="covers-search-term"
                  ref={coverSearchRef}
                  placeholder="search covers"
                  onContextMenu={async () => await window.api.showTextInputMenu()}
                  /*  value={state.coversSearchTerm}
              onChange={handleCoversSearchTerm} */
                />
                <button value="Submit">
                  <GiMagnifyingGlass />
                </button>
              </form>
            </li>
            <li>
              <input
                type="range"
                id="cover-size"
                name="cover-size"
                min="1"
                max="3"
                steps="3"
                list="ticks"
                value={coverSize}
                onChange={handleCoverSize}
              />
              <datalist id="ticks">
                <option value="1"></option>
                <option value="2"></option>
                <option value="3"></option>
              </datalist>
            </li>
            <li>
              {' '}
              <div className="cover-icons" style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="svg-container" id="desc" onClick={handleCoversSort}>
                  <AiFillDownSquare
                    className={coversSortOrder === 'DESC' ? 'sort-icon' : null}
                    style={{ transform: 'rotate(180deg)' }}
                  />
                </span>

                <span className="svg-container" id="asc" onClick={handleCoversSort}>
                  <AiFillDownSquare className={coversSortOrder === 'ASC' ? 'sort-icon' : null} />
                </span>
              </div>
            </li>
            <li>
              {' '}
              <div className="cover-icons" id="missing-covers" onClick={handleMissingCoversRequest}>
                <GrDocumentMissing />
              </div>
            </li>
            <li>
              <div className="cover-icons" id="refresh-covers" onClick={handleCoversRefresh}>
                <IoIosRefresh />
              </div>
            </li>
          </>
        )}
        {/*         <li
          className={homepage === 'stats' ? 'home-cards--item active' : 'home-cards--item'}
          id="stats"
          onClick={handleHomePage}
        >
          <FaTags />
          Tag Editor
        </li>
        <li
          className={homepage === 'playlists' ? 'home-cards--item active' : 'home-cards--item'}
          id="playlists"
          onClick={handleHomePage}
        >
          <PiPlaylistLight />
          Playlists
        </li> */}
      </ul>

      {homepage === 'albums-cover-view' && (
        <AlbumsCoverView resetKey={resetKey} homepage={homepage} coverSize={coverSize} />
      )}
      {homepage === 'stats' && <Stats />}
      {homepage === 'playlists' && <Playlists />}
      {/* {homepage === 'coversearch' && <CoverSearch />} */}
    </>
  );
};

export default Home;
