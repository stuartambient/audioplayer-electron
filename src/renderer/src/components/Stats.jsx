import { useState, useEffect, useRef, useLayoutEffect } from 'react';
/* import { useTotalTracksStat, useTopHundredArtistsStat } from '../hooks/useDb'; */
import { PiFolderOpenLight } from 'react-icons/pi';
import {
  TotalMedia,
  TopHundredArtists,
  Genres,
  NullMetadata,
  AlbumsByRoot,
  TracksByRoot
} from './StatsComponents';
import { useDistinctDirectories /* , useAlbumsByRoot */ } from '../hooks/useDb';
/* import { AiOutlineTrophy } from 'react-icons'; */
import '../style/Stats.css';

const Stats = () => {
  const [statReq, setStatReq] = useState('');
  const [sort, setSort] = useState('col1');
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [directories, setDirectories] = useState([]);
  const [reqDirectories, setReqDirectories] = useState([]);
  const [albumsByRoot, setAlbumsByRoot] = useState([]);
  const [reqDir, setReqDir] = useState('');
  const [root, setRoot] = useState(null);
  const containerRef = useRef(null);
  const [listHeight, setListHeight] = useState(300);
  useDistinctDirectories(setDirectories);

  const updateSize = () => {
    if (containerRef.current) {
      setListHeight(containerRef.current.clientHeight);
    }
  };

  useEffect(() => {
    updateSize(); // Set initial size
    window.addEventListener('resize', updateSize); // Update size on window resize
    return () => window.removeEventListener('resize', updateSize); // Cleanup on unmount
  }, []);

  useEffect(() => {
    if (isSubmenuOpen && reqDirectories.length > 0) {
      setStatReq('directories');
    } else if (!isSubmenuOpen && reqDirectories.length > 0) {
      setReqDirectories([]);
    }
  }, [isSubmenuOpen, reqDirectories]);

  const toggleSubmenu = (event) => {
    if (event.target.id === 'directories' || event.target.id === 'directories-p') {
      setIsSubmenuOpen(!isSubmenuOpen);
    }
    handleStatReq(event);
  };

  const addRoot = (item) => {
    const rootItems = async (item) => {
      const results = await window.api.getAlbumsByRoot(item);
      /* console.log(results); */
      setAlbumsByRoot((prevItems) => [...prevItems, ...results]);
    };
    if (!reqDirectories.includes(item)) {
      /* setReqDirectories((prevItems) => [...prevItems, item]); */
      rootItems(item);
    }
  };

  const removeRoot = (item) => {
    setReqDirectories((prevItems) => prevItems.filter((i) => i !== item));
    setAlbumsByRoot((prevItems) => prevItems.filter((i) => i.rootlocation !== item));
  };

  const handleCheckboxChange = (event, item) => {
    event.stopPropagation();
    if (event.target.checked) {
      setReqDirectories([...reqDirectories, item]);
      //setStatReq('directories');
      addRoot(item);
    } else {
      setReqDirectories(reqDirectories.filter((directory) => directory !== item));
      removeRoot(item);
    }
  };

  const handleStatReq = (e) => {
    if (e.currentTarget.id !== 'directories' && isSubmenuOpen) {
      setIsSubmenuOpen(false);
      setAlbumsByRoot([]);
    }
    setStatReq(e.currentTarget.id);
  };

  const handleOpenFolder = (e) => {
    setRoot(e.target.id);
  };

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
        <li className="stat" id="directories" /* onClick={handleStatReq} */ onClick={toggleSubmenu}>
          Directories
          {isSubmenuOpen && (
            <ul>
              {directories.map((item) => {
                return (
                  <li
                    className="directories"
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <input
                      type="checkbox"
                      id={item}
                      onChange={(e) => handleCheckboxChange(e, item)}
                    />
                    {item}
                    <PiFolderOpenLight id={item} style={{}} onClick={handleOpenFolder} />
                  </li>
                );
              })}
            </ul>
          )}
        </li>
        <li className="stat" id="nometadata" onClick={handleStatReq}>
          <p>Missing metadata</p>
        </li>
        <li>
          Selected Directories:
          {reqDirectories.length > 0 ? (
            <ul>
              {reqDirectories.map((directory) => (
                <li key={directory}>{directory}</li>
              ))}
            </ul>
          ) : (
            <p>No directories selected.</p>
          )}
        </li>
      </ul>

      <div className="stats--results" ref={containerRef}>
        {statReq === 'totalmedia' && <TotalMedia />}
        {statReq === 'genres' && (
          <>
            <div className="stats--sort">
              <p id="col1sort" onClick={handleSort}>
                sort1
              </p>
              <p id="col2sort" onClick={handleSort}>
                sort2
              </p>
            </div>
            <Genres listHeight={listHeight} />
          </>
        )}
        {root && <TracksByRoot root={root} />}
        {statReq === 'directories' && (
          <>
            <div className="stats--length">
              {/* <p id="stats-albums-length">Number of albums loaded: {albumsByRoot.length}</p> */}
            </div>
            <AlbumsByRoot albums={albumsByRoot} listHeight={listHeight} />
          </>
        )}
        {statReq === 'topArtists' && (
          <>
            <div className="stats--sort">
              <p id="col1sort" onClick={handleSort}>
                sort1
              </p>
              <p id="col2sort" onClick={handleSort}>
                sort2
              </p>
            </div>
            <TopHundredArtists listHeight={listHeight} />
          </>
        )}
        {/* {statReq === 'directories' && <AlbumsByRoot albums={albumsByRoot} />} */}
        {/* {statReq === 'directories' && (
          <>
            <div className="stats--length">
              <p id="stats-albums-length">Number of albums loaded: {albumsByRoot.length}</p>
            </div>
            <AlbumsByRoot albums={albumsByRoot} listHeight={listHeight} />
          </>
        )} */}
        {statReq === 'nometadata' && <NullMetadata />}
      </div>
    </div>
  );
};

export default Stats;
