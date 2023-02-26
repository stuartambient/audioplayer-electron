import { useState, useRef, useCallback, useEffect, forwardRef } from 'react';
import { ArchiveAdd, Playlist, Shuffle, Plus, Minus } from '../assets/icons';
import { v4 as uuidv4 } from 'uuid';
import MediaMenu from './MediaMenu';
import Item from './Item';
import {
  useTracks,
  useAlbums,
  useAlbumTracks,
  usePlaylist,
  usePlaylistDialog,
  useAllAlbumsCovers
  /*   useRandomTracks */
} from '../hooks/useDb';
import '../style/InfiniteList.css';
/* import { electronAPI } from '@electron-toolkit/preload'; */
/* import { ipcRenderer } from 'electron'; */

const InfiniteList = ({
  handleTrackSelection,
  currentTrack,
  /* setCurrentTrack, */
  playNext,
  playPrev,
  nextTrack,
  prevTrack,
  active,
  state,
  dispatch,
  listType,
  library,
  tracks,
  tracksPageNumber,
  playlistTracks,
  shuffle,
  minimalmode,
  miniModePlaylist,
  albums,
  albumsPageNumber
}) => {
  const [tracksSearchTerm, setTracksSearchTerm] = useState('');
  const [albumsSearchTerm, setAlbumsSearchTerm] = useState('');

  const [albumPattern, setAlbumPattern] = useState('');
  const [showMore, setShowMore] = useState(null);
  const [sortType, setSortType] = useState('createdon');
  const [resetKey, setResetKey] = useState(null);
  const [checkbox, setCheckbox] = useState([]);
  const [playlistReq, setPlaylistReq] = useState('');
  const { tracksLoading, hasMoreTracks, tracksError } = useTracks(
    tracksPageNumber,
    tracksSearchTerm,
    sortType,
    resetKey,
    state,
    dispatch,
    shuffle
  );
  const { albumsLoading, hasMoreAlbums, albumsError } = useAlbums(
    albumsPageNumber,
    albumsSearchTerm,
    sortType,
    resetKey,
    dispatch
  );

  const { albumTracks, setAlbumTracks } = useAlbumTracks(albumPattern);

  usePlaylist(checkbox[checkbox.length - 1]?.id, dispatch);

  usePlaylistDialog(playlistReq, playlistTracks, dispatch);

  /*   const { shuffledLoading, hasMoreShuffled, shuffledError } = useRandomTracks(
    shuffledTracksPageNumber,
    state,
    dispatch,
    shuffle
  ); */

  /*   useEffect(() => {
    console.log(checkbox, checkbox.length, checkbox[checkbox.length - 1]);
  }, [checkbox]); */

  const albumsTracks = albumTracks.map((track) => {
    if (track.title) {
      return <li key={track.afid}>{track.title}</li>;
    } else {
      <li key={track.afid}>{track.audiofile}</li>;
    }
  });

  const scrollRef = useRef();
  const searchRef = useRef();

  /* HERE */
  useEffect(() => {
    if (listType === 'file') {
      if (currentTrack >= 0 && tracks[currentTrack + 1]) {
        dispatch({
          type: 'set-next-track',
          nextTrack: tracks[currentTrack + 1].afid
        });
      }
      if (currentTrack >= 1 && tracks[currentTrack - 1]) {
        dispatch({
          type: 'set-prev-track',
          prevTrack: tracks[currentTrack - 1].afid
        });
      }
    }
    if (listType === 'playlist') {
      if (currentTrack >= 0 && playlistTracks[currentTrack + 1]) {
        dispatch({
          type: 'set-next-track',
          nextTrack: playlistTracks[currentTrack + 1].afid
        });
      }
      if (currentTrack >= 1 && playlistTracks[currentTrack - 1]) {
        dispatch({
          type: 'set-prev-track',
          prevTrack: playlistTracks[currentTrack - 1].afid
        });
      }
    }
  }, [currentTrack, tracks, playlistTracks, state.selectedTrackListType, dispatch]);

  /* HERE */
  /*   useEffect(() => {
    if (shuffle) {
      dispatch({
        type: 'reset-tracks',
        tracks: []
      });
      dispatch({
        type: 'tracks-pagenumber',
        tracksPageNumber: 0
      });
    }
  }, [shuffle]); */

  useEffect(() => {
    const handleTrackChange = (trackId) => {
      const changeTrack = new Event('click', {
        bubbles: true,
        cancelable: false
      });

      const toTrack = document.getElementById(trackId);
      toTrack.dispatchEvent(changeTrack);
    };

    if (playNext && nextTrack) {
      handleTrackChange(nextTrack);
    }
    if (playPrev && prevTrack) {
      handleTrackChange(prevTrack);
    }
  }, [playNext, nextTrack, playPrev, prevTrack, tracks, currentTrack]);

  /*   useEffect(() => {
    if (open) {
      setOpen(!open);
    }
  }, [open]); */

  const handleTextSearch = (e) => {
    e.preventDefault();
    if (e.currentTarget.textsearch.value === '') {
      setResetKey(getKey());
    }
    if (listType === 'files') {
      dispatch({
        type: 'reset-tracks',
        tracks: []
      });
      dispatch({
        type: 'tracks-pagenumber',
        tracksPageNumber: 0
      });
      dispatch({
        type: 'set-next-track',
        nextTrack: ''
      });
      dispatch({
        type: 'set-prev-track',
        prevTrack: ''
      });
      setTracksSearchTerm(e.currentTarget.textsearch.value);
    }
    if (listType === 'albums') {
      dispatch({
        type: 'reset-albums',
        albums: []
      });
      dispatch({
        type: 'albums-pagenumber',
        albumsPageNumber: 0
      });
      /*       dispatch({
        type: 'set-next-track',
        nextTrack: ''
      });
      dispatch({
        type: 'set-prev-track',
        prevTrack: ''
      }); */
      setAlbumsSearchTerm(e.currentTarget.textsearch.value);
    }
  };

  const handleListCheckboxes = (e) => {
    e.preventDefault();
    /* e.target.checked === false ? (e.target.checked = true) : (e.target.checked = false); */
    const datatype = e.target.getAttribute('data-type');

    switch (datatype) {
      case 'album':
        const isExist = checkbox.find(({ id }) => id === e.target.id);
        if (isExist) {
          const delCurrent = checkbox.filter((i) => i.id !== e.target.id);
          return setCheckbox(delCurrent);
        }

        setCheckbox([...checkbox, { checked: !checkbox.checked, id: e.target.id }]);
        break;
      default:
        return;
    }
  };

  const handlePlaylistFiles = (e) => {
    switch (e.target.id) {
      case 'playlist-save':
        return setPlaylistReq('playlist-save');
      case 'playlist-open': {
        return setPlaylistReq('playlist-open');
      }
      case 'playlist-clear': {
        return dispatch({
          type: 'playlist-clear',
          playlistTracks: []
        });
      }
      default:
        return;
    }
  };

  const handleListScroll = (e) => {};

  const handleContextMenuOption = async (option, id) => {
    console.log('id: ', id);
    /*  const evnt = Object.keys(option.sender._events);
    const selection = evnt.pop(); */
    console.log(option[0] === 'track-to-playlist', option[0]);

    if (option[0] === 'add track to playlist') {
      const track = tracks.find((item) => item.afid === id);
      if (track) {
        dispatch({
          type: 'track-to-playlist',
          playlistTracks: [...playlistTracks, track]
        });
      }
    }
    if (option === 'add album to playlist') {
      console.log('album-to-playlist');
    }
    if (option === 'remove from playlist') {
      console.log('remove-from-playlist');
    }
  };

  const handleContextMenu = async (e) => {
    const type = e.target.getAttribute('fromlisttype');
    if (type === null) return;
    const splitid = e.target.id.split('--')[0];
    const id = splitid;
    switch (type) {
      case 'file':
        await window.api.showTracksMenu();
        await window.api.onTrackToPlaylist((e) => handleContextMenuOption(e, id));

        break;
      case 'folder':
        await window.api.showAlbumsMenu();
        await window.api.onAlbumToPlaylist((e) => handleContextMenuOption(e, id));
        break;
      case 'playlist':
        await window.api.showPlaylistsMenu();
        await window.api.onRemoveFromPlaylist((e) => handleContextMenuOption(e, id));

        break;
      default:
        return;
    }
  };

  useEffect(() => {
    /* console.log('show more: ', showMore, 'albumPattern: ', albumPattern); */
  }, [showMore, albumPattern]);

  const handleAlbumTracksRequest = (e) => {
    const term = e.currentTarget.getAttribute('term');

    if (showMore === e.currentTarget.id) {
      setShowMore(null);
      setAlbumTracks([]);
      setAlbumPattern(null);
    } else {
      setShowMore(e.currentTarget.id);
      setAlbumPattern(term);
    }
    /*  showMore === e.currentTarget.id ? setShowMore(null) : setShowMore(e.currentTarget.id);
    setAlbumPattern(term); */
  };

  const isSortSelected = (value) => {
    if (value !== sortType) return false;
    return true;
  };

  const handleSortClick = (e) => {
    /* setSortType(e.currentTarget); */
    setSortType(e.target.value);
  };

  const getKey = () => uuidv4();

  const filesObserver = useRef();
  const albumsObserver = useRef();
  const playlistObserver = useRef();

  const lastTrackElement = useCallback(
    (node) => {
      if (tracksLoading) return;
      /*  if (!hasMoreFiles) return setSearchTermFiles(""); */
      if (filesObserver.current) filesObserver.current.disconnect();
      filesObserver.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreTracks) {
            dispatch({
              type: 'tracks-pagenumber',
              tracksPageNumber: tracksPageNumber + 1
            });
          }
        },
        {
          root: document.querySelector('.results'),
          rootMargin: '0px',
          threshold: 1.0
        }
      );
      if (node) filesObserver.current.observe(node);
    },
    [tracksLoading, hasMoreTracks]
  );

  const lastAlbumElement = useCallback(
    (node) => {
      if (albumsLoading) return;
      if (albumsObserver.current) albumsObserver.current.disconnect();
      albumsObserver.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreAlbums) {
            /* console.log('entries: ', entries[0].isIntersecting, hasMore); */
            dispatch({
              type: 'albums-pagenumber',
              albumsPageNumber: albumsPageNumber + 1
            });
            /*  dispatch({
              type: "albumsPageNumber",
            }); */
          }
        },
        {
          root: document.querySelector('.results'),
          rootMargin: '0px',
          threshold: 1.0
        }
      );
      if (node) albumsObserver.current.observe(node);
    },
    [albumsLoading, hasMoreAlbums]
  );

  const scrollToView = useCallback(
    (node) => {
      if (!node) return;
      if (active && node && node.getAttribute('id') === `${active}--item-div`) {
        scrollRef.current = node;
        /* scrollRef.current.scrollIntoView(); */
      }
      /*       if (active) {
        console.log(activeRef);
      } */
    },
    [active, scrollRef]
  );

  const byFiles = tracks.map((item, index) => {
    return (
      <Item
        state={state}
        dispatch={dispatch}
        type="file"
        key={getKey()}
        divId={`${item.afid}--item-div`}
        className={`${active}--item-div` === `${item.afid}--item-div` ? 'item active' : 'item'}
        ref={tracks.length === index + 1 ? lastTrackElement : scrollToView}
        href={item.afid}
        id={item.afid}
        like={item.like}
        audiofile={item.audiofile}
        val={index}
        showContextMenu={handleContextMenu}
        handleTrackSelection={handleTrackSelection}
        artist={item.artist ? item.artist : 'not available'}
        title={item.title ? item.title : item.audiofile}
        album={item.album ? item.album : 'not available'}
      />
    );
  });

  const byAlbums = albums.map((item, index) => {
    return (
      <Item
        type="folder"
        key={getKey()}
        id={item.id}
        className="item"
        ref={albums.length === index + 1 ? lastAlbumElement : scrollToView}
        href="http://"
        val={index}
        foldername={item.foldername}
        term={item.fullpath}
        fullpath={item.fullpath}
        handleAlbumTracksRequest={handleAlbumTracksRequest}
        showContextMenu={handleContextMenu}
        showMore={showMore}
        albumPattern={albumPattern}
        albumTracksLength={albumTracks.length}
        albumsTracks={albumsTracks}
        handleListCheckboxes={handleListCheckboxes}
        checked={checkbox.find((k) => k.id === item.id)}
      ></Item>
    );
  });

  const byPlaylist = playlistTracks.map((item, index) => {
    return (
      <Item
        state={state}
        dispatch={dispatch}
        type="playlist"
        key={getKey()}
        divId={`${item.afid}--item-div`}
        className={`${active}--item-div` === `${item.afid}--item-div` ? 'item active' : 'item'}
        /* ref={tracks.length === index + 1 ? lastTrackElement : scrollToView} */
        href={item.afid}
        id={item.afid}
        like={item.like}
        audiofile={item.audiofile}
        val={index}
        showContextMenu={handleContextMenu}
        handleTrackSelection={handleTrackSelection}
        artist={item.artist ? item.artist : 'not available'}
        title={item.title ? item.title : item.audiofile}
        album={item.album ? item.album : 'not available'}
      />
    );
  });

  const listClassNames = () => {
    if (!library) {
      return 'results results-hidden';
    }
    if (library && !minimalmode) {
      return 'results';
    }
    if (library && minimalmode) {
      return 'results results-minimal';
    }
  };

  return (
    <>
      {library === true ? (
        <MediaMenu
          isSortSelected={isSortSelected}
          handleSortClick={handleSortClick}
          listType={state.listType}
          handleTextSearch={handleTextSearch}
          miniModePlaylist={miniModePlaylist}
          handlePlaylistFiles={handlePlaylistFiles}
          dispatch={dispatch}
        />
      ) : null}
      <div className={listClassNames()}>
        {listType === 'files' && !tracks.length && !tracksLoading ? (
          <div className="noresults">No results</div>
        ) : null}
        {listType === 'albums' && !albums.length && !albumsLoading ? (
          <div className="noresults">No results</div>
        ) : null}
        {listType === 'playlist' && !playlistTracks.length ? (
          <div className="noresults">No current playlist</div>
        ) : null}
        {listType === 'files' && (
          <>
            <div className="files">{byFiles}</div>
            <div className="albums" style={{ display: 'none' }}>
              {byAlbums}
            </div>
            <div className="playlist" style={{ display: 'none' }}>
              {byPlaylist}
            </div>
          </>
        )}
        {listType === 'albums' && (
          <>
            <div className="albums">{byAlbums}</div>
            <div className="files" style={{ display: 'none' }}>
              {byFiles}
            </div>
            <div className="playlist" style={{ display: 'none' }}>
              {byPlaylist}
            </div>
          </>
        )}
        {listType === 'playlist' && (
          <>
            <div className="playlist">{byPlaylist}</div>
            <div className="albums" style={{ display: 'none' }}>
              {byAlbums}
            </div>
            <div className="files" style={{ display: 'none' }}>
              {byFiles}
            </div>
          </>
        )}
        {listType === 'files'
          ? tracksLoading && <div className="item itemloading">...Loading</div>
          : null}
        {listType === 'albums'
          ? albumsLoading && <div className="item itemloading">...Loading</div>
          : null}
      </div>
    </>
  );
};

export default InfiniteList;
