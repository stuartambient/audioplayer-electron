import { GiMagnifyingGlass } from 'react-icons/gi';
import '../style/MediaMenu.css';

const MediaMenu = ({
  isSortSelected,
  handleSortClick,
  listType,
  handleTextSearch,
  miniModePlaylist,
  handlePlaylistFiles,
  dispatch,
  shuffle
}) => {
  const handleListType = (listtype) => {
    dispatch({
      type: 'set-list-type',
      listType: listtype
    });
  };

  return (
    <ul className={miniModePlaylist ? 'media-menu media-menu--minimal' : 'media-menu'}>
      {!miniModePlaylist && !shuffle && (
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

      {/*   <div className="right-side"> */}
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
      {listType === 'playlist' && (
        <li className="playlist-dialogs">
          <span id="playlist-clear" onClick={handlePlaylistFiles}>
            Clear
          </span>
          <span id="playlist-open" onClick={handlePlaylistFiles}>
            Open
          </span>
          <span id="playlist-save" onClick={handlePlaylistFiles}>
            Save
          </span>
        </li>
      )}
      <li className="tabs" style={{ color: 'white' }}>
        <div
          className={listType === 'files' ? 'tab active' : 'tab'}
          onClick={() => handleListType('files')}
        >
          <span>files</span>
        </div>
        <div
          className={listType === 'albums' ? 'tab active' : 'tab'}
          onClick={() => handleListType('albums')}
        >
          <span>albums</span>
        </div>
        <div
          className={listType === 'playlist' ? 'tab active' : 'tab'}
          onClick={() => handleListType('playlist')}
        >
          <span>playlist</span>
        </div>
        <div
          className={listType === 'other' ? 'tab active' : 'tab'}
          onClick={() => handleListType('other')}
        >
          <span>other</span>
        </div>
      </li>
      {/* </div> */}
    </ul>
  );
};

export default MediaMenu;
