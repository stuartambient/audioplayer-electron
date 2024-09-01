import { useState, useRef, useEffect } from 'react';
import { useAudioPlayer } from '../AudioPlayerContext';
import { v4 as uuidv4 } from 'uuid';
import { GiMagnifyingGlass } from 'react-icons/gi';
import { AiFillDownSquare } from 'react-icons/ai';
import { GrDocumentMissing } from 'react-icons/gr';
import { IoIosRefresh } from 'react-icons/io';
import '../style/Home.css';
/* import AlbumsCoverView from './AlbumsCoverView'; */
/* import AlbumsCoverView from './TanstackVirtual'; */
//import AlbumsCoverView from './TanstackVirtualExample';
import AlbumsCoverView from './TanstackVirtualCssColumns';
/* import AlbumsCoverView from './VrtualGrid'; */
/* import AlbumsCoverView from './VirtuosoGrid';*/
/* import AlbumsCoverView from './ReactWindow'; */
/* import CoverSearch from './CoverSearch'; */

const Home = () => {
  const { state, dispatch } = useAudioPlayer();
  const [homepage, setHomePage] = useState('albums-cover-view');
  const [resetKey, setResetKey] = useState('');
  const [coversSortOrder, setCoversSortOrder] = useState('DESC');
  const [coverSize, setCoverSize] = useState(1);
  const getKey = () => uuidv4();

  const handleCoverSize = (e) => {
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
      <ul className="album-cover-tools" style={{ color: 'white' }}>
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
      </ul>

      <AlbumsCoverView resetKey={resetKey} coverSize={coverSize} />
    </>
  );
};

export default Home;
