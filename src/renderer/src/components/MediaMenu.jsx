import { GiMagnifyingGlass } from 'react-icons/gi';
import '../style/MediaMenu.css';

const MediaMenu = ({
  isFilesSortSelected,
  isAlbumsSortSelected,
  handleSortClick,
  listType,
  handleTextSearch,
  miniModePlaylist,
  handlePlaylistFiles,
  dispatch,
  playlistShuffle,
  tracksShuffle
}) => {
  const handleListType = (listtype) => {
    dispatch({
      type: 'set-list-type',
      listType: listtype
    });
  };

  const handleInputMenu = async (e) => {
    console.log(e.target);
    await window.api.showTextInputMenu();
    await window.api.onTextInputMenu((e) => console.log(e));
  };

  return (
    <ul className={miniModePlaylist ? 'media-menu media-menu--minimal' : 'media-menu'}>
      {!miniModePlaylist && !tracksShuffle && listType === 'files' && (
        <div className="sort-menu">
          <fieldset>
            <li className="sort-menu--option">
              <label htmlFor="new">new</label>
              <input
                type="radio"
                id="createdon"
                name="sortby"
                value="createdon"
                checked={isFilesSortSelected('createdon')}
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
                checked={isFilesSortSelected('artist')}
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
                checked={isFilesSortSelected('title')}
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
                checked={isFilesSortSelected('genre')}
                onChange={handleSortClick}
              />
            </li>
          </fieldset>
        </div>
      )}
      {!miniModePlaylist && listType === 'albums' && (
        <div className="sort-menu">
          <fieldset>
            <li className="sort-menu--option">
              <label htmlFor="new">new</label>
              <input
                type="radio"
                id="datecreated"
                name="sortby"
                value="datecreated"
                checked={isAlbumsSortSelected('datecreated')}
                onChange={handleSortClick}
              />
            </li>
            <li className="sort-menu--option">
              <label htmlFor="artist">album</label>
              <input
                type="radio"
                id="foldername"
                name="sortby"
                value="foldername"
                checked={isAlbumsSortSelected('foldername')}
                onChange={handleSortClick}
              />
            </li>
          </fieldset>
        </div>
      )}

      {/*   <div className="right-side"> */}
      {!tracksShuffle && (
        <li className="form">
          <form method="post" onSubmit={handleTextSearch}>
            <div className="formelements">
              <input
                type="text"
                className="textsearch"
                name="textsearch"
                id="textsearch"
                onContextMenu={handleInputMenu}
              />

              <button type="submit" className="submitbtn">
                <div className="icon">
                  <GiMagnifyingGlass />
                </div>
              </button>
            </div>
          </form>
        </li>
      )}
      {tracksShuffle && listType === 'albums' && (
        <li className="form">
          <form method="post" onSubmit={handleTextSearch}>
            <div className="formelements">
              <input
                type="text"
                className="textsearch"
                name="textsearch"
                id="textsearch"
                onContextMenu={handleInputMenu}
              />

              <button type="submit" className="submitbtn">
                <div className="icon">
                  <GiMagnifyingGlass />
                </div>
              </button>
            </div>
          </form>
        </li>
      )}
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
