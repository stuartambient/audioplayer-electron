import { useAudioPlayer } from '../AudioPlayerContext';
import { GiMagnifyingGlass } from 'react-icons/gi';
import '../style/MediaMenu.css';

const MediaMenu = ({
  isFilesSortSelected,
  isAlbumsSortSelected,
  handleSortClick,
  handleTextSearch,
  handlePlaylistFiles
}) => {
  const { state, dispatch } = useAudioPlayer();
  const handleListType = (type) => {
    dispatch({
      type: 'set-list-type',
      listType: type
      /*   newtrack: '',
      nextTrack: '',
      prevTrack: '',
      pause: true */
    });
  };

  const handleInputMenu = async (e) => {
    console.log(e.target);
    await window.api.showTextInputMenu();
    /* await window.api.onTextInputMenu((e) => console.log(e)); */
  };

  return (
    <ul className={state.miniModePlaylist ? 'media-menu media-menu--minimal' : 'media-menu'}>
      {!state.miniModePlaylist && !state.tracksShuffle && state.listType === 'files' && (
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
              <label htmlFor="genres">genres</label>
              <input
                type="radio"
                id="genres"
                name="sortby"
                value="genres"
                checked={isFilesSortSelected('genres')}
                onChange={handleSortClick}
              />
            </li>
          </fieldset>
        </div>
      )}
      {!state.miniModePlaylist && state.listType === 'albums' && (
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
      {!state.tracksShuffle && state.listType === 'files' && (
        <li className="form">
          <form method="post" onSubmit={handleTextSearch}>
            <div className="formelements">
              <input
                type="text"
                className="textsearch"
                name="textsearch"
                id="textsearch"
                placeholder="   search tracks"
                /* onContextMenu={handleInputMenu} */
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
      {state.listType === 'albums' && (
        <li className="form">
          <form method="post" onSubmit={handleTextSearch}>
            <div className="formelements">
              <input
                type="text"
                className="textsearch"
                name="textsearch"
                id="textsearch"
                placeholder="   search albums"
                /* onContextMenu={handleInputMenu} */
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
      {state.listType === 'playlist' && (
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
          className={state.listType === 'files' ? 'tab active' : 'tab'}
          onClick={() => handleListType('files')}
        >
          <span>tracks</span>
        </div>
        <div
          className={state.listType === 'albums' ? 'tab active' : 'tab'}
          onClick={() => handleListType('albums')}
        >
          <span>albums</span>
        </div>
        <div
          className={state.listType === 'playlist' ? 'tab active' : 'tab'}
          onClick={() => handleListType('playlist')}
        >
          <span>playlist</span>
        </div>
      </li>
      {/* </div> */}
    </ul>
  );
};

export default MediaMenu;
