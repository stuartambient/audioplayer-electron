import { useState, useEffect } from 'react';
/* import { useTotalTracksStat, useTopHundredArtistsStat } from '../hooks/useDb'; */
import { TotalMedia, TopHundredArtists, Genres, NullMetadata } from './StatsComponents';
import { useDistinctDirectories } from '../hooks/useDb';
/* import { AiOutlineTrophy } from 'react-icons'; */
import '../style/Stats.css';

const Stats = () => {
  const [req, setReq] = useState('');
  const [sort, setSort] = useState('col1');
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const [directories, setDirectories] = useState([]);
  const [reqDirectories, setReqDirectories] = useState([]);
  useDistinctDirectories(setDirectories);

  /*   useTotalTracksStat(setDirectories); */

  const toggleSubmenu = (event) => {
    // Check if the click is directly on the 'Directories' title or the `li` itself
    if (event.target.id === 'directories' || event.target.id === 'directories-p') {
      setIsSubmenuOpen(!isSubmenuOpen);
    }
    // Otherwise, do nothing (let the checkbox clicks be handled by their own handler)
  };

  const handleCheckboxChange = (event, item) => {
    event.stopPropagation();
    if (event.target.checked) {
      setReqDirectories([...reqDirectories, item]);
    } else {
      // If the checkbox is unchecked, remove the item from the array
      setReqDirectories(reqDirectories.filter((directory) => directory !== item));
    }
  };

  const handleStatReq = (e) => setReq(e.currentTarget.id);

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
          <p id="directories-p">Directories</p>
          {isSubmenuOpen && (
            <ul>
              {directories.map((item) => {
                return (
                  <li key={item}>
                    <input
                      type="checkbox"
                      id={item}
                      onChange={(e) => handleCheckboxChange(e, item)}
                    />
                    {item}
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
        {req === 'totalmedia' && <TotalMedia />}
        {req === 'genres' && (
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
        {req === 'topArtists' && (
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
        {req === 'nometadata' && <NullMetadata />}
      </div>
    </div>
  );
};

export default Stats;
