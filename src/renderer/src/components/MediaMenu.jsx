import { GiMagnifyingGlass } from 'react-icons/gi';
import Switch from './Switch';
import '../style/MediaMenu.css';

const MediaMenu = ({
  isSortSelected,
  handleSortClick,
  type,
  setType,
  handleTextSearch,
  miniModePlaylist
}) => {
  return (
    <ul className={miniModePlaylist ? 'media-menu media-menu--minimal' : 'media-menu'}>
      {!miniModePlaylist && (
        <div className="sort-menu">
          <fieldset>
            <li className="sort-menu--option">
              <label htmlFor="new">new</label>
              <input
                type="radio"
                id="createdon"
                name="sortby"
                value="createdon"
                checked={isSortSelected('createdon')}
                onChange={handleSortClick}
              />
            </li>
            <li className="sort-menu--option">
              <label htmlFor="artist">artist</label>
              <input
                type="radio"
                id="artist"
                name="sortby"
                value="artist"
                checked={isSortSelected('artist')}
                onChange={handleSortClick}
              />
            </li>
            <li className="sort-menu--option">
              <label htmlFor="recent">title</label>
              <input
                type="radio"
                id="title"
                name="sortby"
                value="title"
                checked={isSortSelected('title')}
                onChange={handleSortClick}
              />
            </li>
            <li className="sort-menu--option">
              <label htmlFor="genre">genre</label>
              <input
                type="radio"
                id="genre"
                name="sortby"
                value="genre"
                checked={isSortSelected('genre')}
                onChange={handleSortClick}
              />
            </li>
          </fieldset>
        </div>
      )}
      {/* <li>
        <Switch
          type={type}
          setType={setType}
          className={
            miniModePlaylist ? 'switch-container switch-container--minimal' : 'switch-container'
          }
        />
      </li> */}
      <div className="right-side">
        <li className="form">
          <form method="post" onSubmit={handleTextSearch}>
            <div className="formelements">
              <input type="text" className="textsearch" name="textsearch" id="textsearch" />

              <button type="submit" className="submitbtn">
                <div className="icon">
                  <GiMagnifyingGlass />
                </div>
              </button>
            </div>
          </form>
        </li>
        <li className="tabs" style={{ color: 'white' }}>
          <span className="tab" onClick={() => setType('files')}>
            files
          </span>
          <span className="tab" onClick={() => setType('albums')}>
            albums
          </span>
          <span className="tab" onClick={() => setType('playlist')}>
            playlist
          </span>
        </li>
      </div>
    </ul>
  );
};

export default MediaMenu;
