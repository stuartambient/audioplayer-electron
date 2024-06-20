import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { PiFolderOpenLight } from 'react-icons/pi';
import {
  TotalMedia,
  TopHundredArtists,
  Genres,
  AlbumsByRoot,
  TracksByRoot
} from './StatsComponents';
import { useDistinctDirectories } from '../hooks/useDb';
import { openChildWindow } from './ChildWindows/openChildWindow';
import '../style/Stats.css';

const Stats = () => {
  const [statReq, setStatReq] = useState('');
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [directories, setDirectories] = useState([]);
  const [reqDirectories, setReqDirectories] = useState([]);
  const [albumsByRoot, setAlbumsByRoot] = useState([]);
  const [root, setRoot] = useState('');
  const resultsRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  useDistinctDirectories(setDirectories);

  useEffect(() => {
    if (isSubmenuOpen && reqDirectories.length > 0) {
      setStatReq('directories');
    } else if (!isSubmenuOpen && reqDirectories.length > 0) {
      setReqDirectories([]);
    }
  }, [isSubmenuOpen, reqDirectories]);

  useEffect(() => {
    const observedElement = resultsRef.current;

    if (!observedElement) {
      console.error('Observed element is null or undefined');
      return;
    }

    if (!(observedElement instanceof Element)) {
      console.error('Observed element is not a valid DOM element');
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    observer.observe(observedElement);

    // Cleanup function
    return () => {
      observer.unobserve(observedElement);
      observer.disconnect();
    };
  }, []);

  const toggleSubmenu = (event) => {
    if (event.target.id === 'directories' || event.target.id === 'directories-p') {
      setIsSubmenuOpen(!isSubmenuOpen);
    }
    handleStatReq(event);
  };

  const addRoot = (item) => {
    const rootItems = async (item) => {
      const results = await window.api.getAlbumsByRoot(item);
      setAlbumsByRoot((prevItems) => [...prevItems, ...results]);
    };
    if (!reqDirectories.includes(item)) {
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
  };

  const handleOpenFolder = (e) => {
    const newRoot = e.target.id;
    if (newRoot !== root) {
      console.log(`Updating root from ${root} to ${newRoot}`);
      setRoot(newRoot);
    }
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

      <div className="stats--results" ref={resultsRef}>
        {statReq === 'totalmedia' && <TotalMedia />}
        {statReq === 'genres' && (
          <>
            <Genres />
          </>
        )}
        {root && <TracksByRoot root={root} />}
        {root && <div>Viewing root: {root}</div>}
        {statReq === 'directories' && albumsByRoot.length > 0 && (
          <>
            <AlbumsByRoot
              albums={albumsByRoot}
              amountLoaded={albumsByRoot.length}
              dimensions={dimensions}
            />
          </>
        )}
        {statReq === 'topArtists' && (
          <>
            <TopHundredArtists />
          </>
        )}
      </div>
    </div>
  );
};

export default Stats;
