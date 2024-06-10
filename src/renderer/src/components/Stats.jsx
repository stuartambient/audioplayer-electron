import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { PiFolderOpenLight } from 'react-icons/pi';
import { TotalMedia, TopHundredArtists, Genres, AlbumsByRoot } from './StatsComponents';
import { useDistinctDirectories /* , useAlbumsByRoot */ } from '../hooks/useDb';
import { openChildWindow } from './ChildWindows/openChildWindow';
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
  const [root, setRoot] = useState('');
  const [rootTracks, setRootTracks] = useState();
  const [totalTracksData, setTotalTracksData] = useState(null);
  const [topArtistsData, setTopArtistsData] = useState(null);
  const [allGenres, setAllGenres] = useState(null);
  useDistinctDirectories(setDirectories);

  useEffect(() => {
    if (isSubmenuOpen && reqDirectories.length > 0) {
      setStatReq('directories');
    } else if (!isSubmenuOpen && reqDirectories.length > 0) {
      setReqDirectories([]);
    }
  }, [isSubmenuOpen, reqDirectories]);

  useEffect(() => {
    const getTracks = async () => {
      const openTable = await window.api.checkForOpenTable('table-data');
      if (openTable) {
        await window.api.clearTable();
      }
      const results = await window.api.getTracksByRoot(root);
      /* setRootTracks(results); */
      /* console.log('results: ', results.length); */

      openChildWindow(
        'table-data',
        'root-tracks',
        {
          width: 1200,
          height: 550,
          show: false,
          resizable: true,
          preload: 'metadataEditing',
          sandbox: false,
          webSecurity: false,
          contextIsolation: true
        },
        results
      );
    };
    if (root) getTracks();
    return () => setRoot('');
  }, [root]);

  useEffect(() => {
    const fetchData = async () => {
      if (statReq === 'totalmedia' && !totalTracksData) {
        const totalTracksRequest = await window.api.totalTracksStat();
        setTotalTracksData(totalTracksRequest);
      } else if (statReq === 'topArtists' && !topArtistsData) {
        const topArtistsRequest = await window.api.topHundredArtistsStat();
        setTopArtistsData(topArtistsRequest);
      } else if (statReq === 'genres' && !allGenres) {
        const allGenresRequest = await window.api.genresStat();
        setAllGenres(allGenresRequest);
      }
    };

    fetchData();

    // Cleanup function to reset data when statReq changes
    return () => {
      if (statReq !== 'totalmedia') {
        setTotalTracksData(null);
      }
      if (statReq !== 'topArtists') {
        setTopArtistsData(null);
      }
      if (statReq !== 'genres') {
        setAllGenres(null);
      }
    };
  }, [statReq, totalTracksData, topArtistsData, allGenres]);

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

  const handleStatReq = async (e) => {
    if (e.currentTarget.id !== 'directories' && isSubmenuOpen) {
      setIsSubmenuOpen(false);
      setAlbumsByRoot([]);
    }
    setStatReq(e.currentTarget.id);
    /* if (statReq !== 'totalmedia' && totalTracksData) {
      setTotalTracksData(null);
    }
    if (statReq !== 'topArtists' && topArtistsData) {
      setTopArtistsData(null);
    }
    if (statReq !== 'genres' && allGenres) {
      setAllGenres(null);
    }

    if (statReq === 'totalmedia' && !totalTracksData) {
      const totalTracksRequest = await window.api.totalTracksStat();
      setTotalTracksData(totalTracksRequest);
    }

    if (statReq === 'topArtists' && !topArtistsData) {
      const topArtistsRequest = await window.api.topHundredArtistsStat();
      setTopArtistsData(topArtistsRequest);
    }
    if (statReq === 'genres' && !allGenres) {
      const allGenresRequest = await window.api.genresStat();
      setAllGenres(allGenresRequest);
    } */
  };

  const handleOpenFolder = (e) => {
    const newRoot = e.target.id;
    if (newRoot !== root) {
      console.log(`Updating root from ${root} to ${newRoot}`);
      setRoot(newRoot);
    }
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
                    <PiFolderOpenLight key={item} id={item} style={{}} onClick={handleOpenFolder} />
                  </li>
                );
              })}
            </ul>
          )}
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

      <div className="stats--results">
        {statReq === 'totalmedia' && <TotalMedia totalTracks={totalTracksData} />}
        {statReq === 'genres' && <Genres allGenres={allGenres} />}
        {/*       {rootTracks && <TracksByRoot rootTracks={rootTracks} />} */}
        {statReq === 'directories' && (
          <>
            <div className="stats--length">
              {/* <p id="stats-albums-length">Number of albums loaded: {albumsByRoot.length}</p> */}
            </div>
            <AlbumsByRoot albums={albumsByRoot} />
          </>
        )}
        {statReq === 'topArtists' && (
          <>
            <TopHundredArtists topArtists={topArtistsData} />
          </>
        )}
      </div>
    </div>
  );
};

export default Stats;
