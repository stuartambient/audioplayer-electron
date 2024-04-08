import { useState, useEffect } from 'react';
/* import { useTotalTracksStat, useTopHundredArtistsStat } from '../hooks/useDb'; */
import { PiFolderOpenLight } from 'react-icons/pi';
import {
  TotalMedia,
  TopHundredArtists,
  Genres,
  NullMetadata,
  AlbumsByRoot
  /*   RootDirectories,
  ExpandedRoot */
  /* LoadAlbumsByRoot */
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
  /* const [expandList, setExpandList] = useState(false); */
  /* const [expandFolder, setExpandFolder] = useState(''); */
  const [albumsByRoot, setAlbumsByRoot] = useState([]);
  const [reqDir, setReqDir] = useState('');
  useDistinctDirectories(setDirectories);

  /* useAlbumsByRoot(reqDirectories, setAlbumsByRoot); */

  /*   useTotalTracksStat(setDirectories); */

  useEffect(() => {
    if (isSubmenuOpen && reqDirectories.length > 0) {
      setStatReq('directories');
    } else if (!isSubmenuOpen && reqDirectories.length > 0) {
      setReqDirectories([]);
    }
  }, [isSubmenuOpen, reqDirectories]);

  const toggleSubmenu = (event) => {
    console.log('toggleSubmenu: ', event.target.id);
    // Check if the click is directly on the 'Directories' title or the `li` itself
    if (event.target.id === 'directories' || event.target.id === 'directories-p') {
      setIsSubmenuOpen(!isSubmenuOpen);
    }
    // Otherwise, do nothing (let the checkbox clicks be handled by their own handler)
  };

  const addRoot = (item) => {
    const rootItems = async (item) => {
      const results = await window.api.getAlbumsByRoot(item);
      /* console.log(results); */
      setAlbumsByRoot((prevItems) => [...prevItems, ...results]);
    };
    if (!reqDirectories.includes(item)) {
      //setReqDirectories((prevItems) => [...prevItems, item]);
      rootItems(item);
    }
  };

  const removeRoot = (item) => {
    /*     console.log('removeRoot: ', item);
    albumsByRoot.forEach((a) =>
      console.log(a)
    ); */
    setReqDirectories((prevItems) => prevItems.filter((i) => i !== item));
    setAlbumsByRoot((prevItems) => prevItems.filter((i) => i.rootlocation !== item));
  };

  const handleCheckboxChange = (event, item) => {
    event.stopPropagation();
    if (event.target.checked) {
      setReqDirectories([...reqDirectories, item]);
      addRoot(item);
    } else {
      // If the checkbox is unchecked, remove the item from the array
      setReqDirectories(reqDirectories.filter((directory) => directory !== item));
      removeRoot(item);
    }
  };

  const handleStatReq = (e) => {
    console.log('e.currentTarget.id: ', e.currentTarget.id);
    setStatReq(e.currentTarget.id);
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
        <li className="stat" id="directories" onClick={toggleSubmenu}>
          Directories
          {isSubmenuOpen && (
            <ul>
              {directories.map((item) => {
                return (
                  <li
                    className="directories"
                    key={item}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    <input
                      type="checkbox"
                      id={item}
                      onChange={(e) => handleCheckboxChange(e, item)}
                    />
                    {item}
                    <PiFolderOpenLight />
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

      <div className="stats--results">
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
            <Genres />
          </>
        )}
        {/*         {req === 'directories' && (
          <RootDirectories
            directories={reqDirectories}
            setExpandList={setExpandList}
            expandList={expandList}
            setExpandFolder={setExpandFolder}
          ></RootDirectories>
        )} */}
        {/*  {expandList && <ExpandedRoot expandFolder={expandFolder} />} */}
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
            <TopHundredArtists />
          </>
        )}
        {statReq === 'directories' && <AlbumsByRoot albums={albumsByRoot} />}
        {statReq === 'nometadata' && <NullMetadata />}
      </div>
    </div>
  );
};

export default Stats;
