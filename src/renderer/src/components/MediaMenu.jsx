import { useAudioPlayer } from '../AudioPlayerContext';
import { GiMagnifyingGlass } from 'react-icons/gi';
import { AiFillDownSquare } from 'react-icons/ai';
import { LuScrollText } from 'react-icons/lu';
import '../style/MediaMenu.css';

const MediaMenu = ({
  isFilesSortSelected,
  isAlbumsSortSelected,
  handleSortClick,
  handleTextSearch,
  handlePlaylistFiles,
  filesSortType,
  albumsSortType
}) => {
  const { state, dispatch } = useAudioPlayer();
  const handleListType = (type) => {
    /*     if (type !== 'albums') {
      dispatch({
        type: 'reset-queue'
      });
    } */
    dispatch({
      type: 'set-list-type',
      listType: type
      /*   newtrack: '',
      nextTrack: '',
      prevTrack: '',
      pause: true */
    });
  };

  const handleScrollOption = () => {
    console.log('scroller');
    dispatch({
      type: 'list-scroll-option'
    });
  };

  const handleInputMenu = async (e) => {
    console.log(e.target);
    await window.api.showTextInputMenu();
    /* await window.api.onTextInputMenu((e) => console.log(e)); */
  };

  return (
    /*     <div><span className="svg-container" id="desc">
    <AiFillDownSquare
      className={coversSortOrder === 'DESC' ? 'sort-icon' : null}
      style={{ transform: 'rotate(180deg)' }}
    />
    
  </span></div> */
    <ul className={state.miniModePlaylist ? 'media-menu media-menu--minimal' : 'media-menu'}>
      {!state.miniModePlaylist && !state.tracksShuffle && state.listType === 'files' && (
        <>
          <div
            className={state.listScroll ? 'list-scroll' : 'list-scroll disabled'}
            onClick={handleScrollOption}
          >
            <LuScrollText
              onClick={(e) => {
                e.stopPropagation(); // Prevent the event from bubbling to the <li>
                handleScrollOption(); // If you want it to handle clicks specifically on the icon
              }}
            />
          </div>
          <div className="sort-menu">
            <div className="cover-icons" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="svg-container" id="DESC" onClick={handleSortClick}>
                <AiFillDownSquare
                  className={filesSortType === 'DESC' ? 'sort-icon' : 'sort-icon-static'}
                  style={{ transform: 'rotate(180deg)' }}
                />
              </span>

              <span className="svg-container" id="ASC" onClick={handleSortClick}>
                <AiFillDownSquare
                  className={filesSortType === 'ASC' ? 'sort-icon' : 'sort-icon-static'}
                />
              </span>
            </div>
          </div>
        </>
      )}
      {!state.miniModePlaylist && state.listType === 'albums' && (
        <div className="sort-menu">
          <div className="cover-icons" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="svg-container" id="DESC" onClick={handleSortClick}>
              <AiFillDownSquare
                className={albumsSortType === 'DESC' ? 'sort-icon' : 'sort-icon-static'}
                style={{ transform: 'rotate(180deg)' }}
              />
            </span>

            <span className="svg-container" id="ASC" onClick={handleSortClick}>
              <AiFillDownSquare
                className={albumsSortType === 'ASC' ? 'sort-icon' : 'sort-icon-static'}
              />
            </span>
          </div>
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
                onContextMenu={async () => await window.api.showTextInputMenu()}
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
                onContextMenu={async () => await window.api.showTextInputMenu()}
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
        <>
          <div
            className={state.listScroll ? 'list-scroll-playlist' : 'list-scroll-playlist disabled'}
            onClick={handleScrollOption}
          >
            <LuScrollText
              onClick={(e) => {
                e.stopPropagation(); // Prevent the event from bubbling to the <li>
                handleScrollOption(); // If you want it to handle clicks specifically on the icon
              }}
            />
          </div>
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
        </>
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
