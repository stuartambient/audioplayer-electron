import { useState, useRef, useCallback, useEffect, forwardRef } from 'react';
import { useAudioPlayer } from '../AudioPlayerContext';
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

const InfiniteList = () => {
  const { state, dispatch } = useAudioPlayer();
  const [tracksSearchTerm, setTracksSearchTerm] = useState('');
  const [albumsSearchTerm, setAlbumsSearchTerm] = useState('');

  const [albumPattern, setAlbumPattern] = useState('');
  const [showMore, setShowMore] = useState(null);
  const [filesSortType, setFilesSortType /* scrollRef */] = useState('createdon');
  const [albumsSortType, setAlbumsSortType /* scrollRef */] = useState('datecreated');
  const [resetKey, setResetKey] = useState(null);
  const [flashDiv, setFlashDiv] = useState({ type: '', id: '' });
  const [loadedAlbums, setLoadedAlbums] = useState([]);
  const [shuffledPlaylist, setShuffledPlaylist] = useState([]);

  const [playlistReq, setPlaylistReq] = useState('');
  const { tracksLoading, hasMoreTracks, tracksError } = useTracks(
    state.tracksPageNumber,
    tracksSearchTerm,
    filesSortType,
    resetKey,
    state,
    dispatch,
    state.tracksShuffle
  );
  const { albumsLoading, hasMoreAlbums, albumsError } = useAlbums(
    state.albumsPageNumber,
    albumsSearchTerm,
    albumsSortType,
    resetKey,
    dispatch
  );

  const { albumTracks, setAlbumTracks } = useAlbumTracks(albumPattern);

  useEffect(() => {
    const handleShuffling = () => {
      setShuffledPlaylist(
        state.playlistTracks.map((item) => item).sort((a) => (Math.random() > 0.5 ? 1 : -1))
      );
    };
    if (state.playlistShuffle) handleShuffling();
  }, [state.playlistShuffle, state.playlistTracks]);
  /*   usePlaylist(albumId, dispatch); */

  usePlaylistDialog(playlistReq, state.playlistTracks, dispatch, setPlaylistReq);

  const albumsTracks = albumTracks.map((track) => {
    console.log('mapped: ', track);
    if (track.title) {
      return <li key={track.afid}>{track.title}</li>;
    } else {
      return <li key={track.afid}>{track.audiofile}</li>;
    }
  });

  const scrollRef = useRef();

  useEffect(() => {
    if (state.listType === 'files') {
      if (state.newtrack >= 0 && state.tracks[+state.newtrack + 1]) {
        /* console.log('next up: ', state.tracks[+state.newtrack + 1]); */
        dispatch({
          type: 'set-next-track',
          nextTrack: state.tracks[+state.newtrack + 1].afid
        });
      }
      if (state.newtrack >= 1 && state.tracks[+state.newtrack - 1]) {
        dispatch({
          type: 'set-prev-track',
          prevTrack: state.tracks[+state.newtrack - 1].afid
        });
      }
    }
    if (state.listType === 'playlist' && !state.playlistShuffle) {
      if (state.newtrack >= 0 && state.playlistTracks[state.newtrack + 1]) {
        dispatch({
          type: 'set-next-track',
          nextTrack: state.playlistTracks[state.newtrack + 1].afid
        });
      }
      if (state.newtrack >= 1 && state.playlistTracks[state.newtrack - 1]) {
        dispatch({
          type: 'set-prev-track',
          prevTrack: state.playlistTracks[state.newtrack - 1].afid
        });
      }
    }
    if (state.playlistShuffle) {
      if (state.newtrack >= 0 && shuffledPlaylist[state.newtrack + 1]) {
        dispatch({
          type: 'set-next-track',
          nextTrack: shuffledPlaylist[state.newtrack + 1].afid
        });
      }
      if (state.newtrack >= 1 && shuffledPlaylist[state.newtrack - 1]) {
        dispatch({
          type: 'set-prev-track',
          prevTrack: shuffledPlaylist[state.newtrack - 1].afid
        });
      }
    }
  }, [
    state.newtrack,
    state.tracks,
    state.playlistTracks,
    shuffledPlaylist,
    state.listType,
    dispatch
  ]);

  useEffect(() => {
    const handleTrackChange = (trackId) => {
      console.log('track ID: ', trackId);
      const changeTrack = new Event('click', {
        bubbles: true,
        cancelable: false
      });

      const toTrack = document.getElementById(trackId);
      toTrack.dispatchEvent(changeTrack);
    };

    if (state.playNext && state.nextTrack) {
      handleTrackChange(state.nextTrack);
    }
    if (state.playPrev && state.prevTrack) {
      handleTrackChange(state.prevTrack);
    }
  }, [
    state.playNext,
    state.nextTrack,
    state.playPrev,
    state.prevTrack,
    state.tracks,
    state.nextTrack
  ]);

  const handleTextSearch = (e) => {
    e.preventDefault();
    if (e.currentTarget.textsearch.value === '') {
      setResetKey(getKey());
    }
    if (state.listType === 'files') {
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
    if (state.listType === 'albums') {
      dispatch({
        type: 'reset-albums',
        albums: []
      });
      dispatch({
        type: 'albums-pagenumber',
        albumsPageNumber: 0
      });

      setAlbumsSearchTerm(e.currentTarget.textsearch.value);
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

  useEffect(() => {
    if (flashDiv.id !== '' && flashDiv.type !== '') {
      /* if (flashDiv.type === file) return; */
      const item = document.getElementById(flashDiv.id);
      item.classList.add('flash');
    }

    /* return () => setTimeout(() => setFlashDiv({ type: '', id: '' }), 3000); */
  }, [flashDiv]);

  useEffect(() => {
    if (flashDiv.type === 'file') {
      setTimeout(() => setFlashDiv({ type: '', id: '' }), 1000);
    }
  }, [flashDiv]);

  const handleContextMenuOption = async (option, id, term = null) => {
    if (option[0] === 'add track to playlist') {
      const track = state.tracks.find((item) => item.afid === id);

      if (track) {
        if (!state.playlistTracks.find((e) => e.afid === id)) {
          setFlashDiv({ type: 'file', id: `${track.afid}--item-div` });
        } else {
          return;
        }
        dispatch({
          type: 'track-to-playlist',
          playlistTracks: [...state.playlistTracks, track]
        });
      }
    }
    if (option[0] === 'add album to playlist') {
      const albumTracks = await window.api.getAlbumTracks(term);
      dispatch({
        type: 'play-album',
        playlistTracks: albumTracks
      });
      const incompleteAlbum = albumTracks.filter((track) =>
        state.playlistTracks.find((t) => t.afid === track.afid)
      );
      if (incompleteAlbum.length < albumTracks.length) {
        const removeAlbum = loadedAlbums.filter((la) => la !== id);
        setLoadedAlbums(removeAlbum);
        setFlashDiv({ type: 'folder', id: id });
      }
      if (!loadedAlbums.includes(id)) {
        setLoadedAlbums([...loadedAlbums, id]);
        setFlashDiv({ type: 'folder', id: id });
      } else {
        return;
      }
    }
    if (option[0] === 'remove from playlist') {
      const removeTrack = state.playlistTracks.filter((track) => track.afid !== id);
      dispatch({
        type: 'playlist-clear',
        playlistTracks: removeTrack
      });
    }
  };

  const handleContextMenu = async (e) => {
    console.log('handleContextMenu: ', e);
    e.preventDefault();
    const term = e.target.getAttribute('fullpath');
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
        await window.api.onAlbumToPlaylist((e) => handleContextMenuOption(e, id, term));
        break;
      case 'playlist':
        await window.api.showPlaylistsMenu();
        await window.api.onRemoveFromPlaylist((e) => handleContextMenuOption(e, id));

        break;
      default:
        return;
    }
  };

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
  };

  const isFilesSortSelected = (value) => {
    if (value !== filesSortType) return false;
    return true;
  };

  const isAlbumsSortSelected = (value) => {
    if (value !== albumsSortType) return false;
    return true;
  };

  const handleSortClick = (e) => {
    if (state.tracksShuffle || state.playlistShuffle) return;
    if (state.listType === 'files') {
      dispatch({
        type: 'tracks-pagenumber',
        tracksPageNumber: 0
      });
      dispatch({
        type: 'reset-tracks',
        tracks: []
      });
      setFilesSortType(e.target.value);
    } else if (state.listType === 'albums') {
      dispatch({
        type: 'albums-pagenumber',
        albumsPageNumber: 0
      });
      dispatch({
        type: 'reset-albums',
        albums: []
      });
      setAlbumsSortType(e.target.value);
    }
  };

  const getKey = () => uuidv4();

  const filesObserver = useRef();
  const albumsObserver = useRef();
  const playlistObserver = useRef();

  const lastTrackElement = useCallback(
    (node) => {
      if (tracksLoading) return;
      if (filesObserver.current) filesObserver.current.disconnect();
      filesObserver.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreTracks) {
            console.log('new page');
            dispatch({
              type: 'tracks-pagenumber',
              tracksPageNumber: state.tracksPageNumber + 1
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
            dispatch({
              type: 'albums-pagenumber',
              albumsPageNumber: state.albumsPageNumber + 1
            });
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
      if (state.active && node && node.getAttribute('id') === `${state.active}--item-div`) {
        scrollRef.current = node;
        /* scrollRef.current.scrollIntoView(); */
      }
      /*       if (active) {
        console.log(activeRef);
      } */
    },
    [state.active, scrollRef]
  );

  const byFiles = state.tracks.map((item, index) => {
    if (!item) return;
    return (
      <Item
        type="file"
        key={getKey()}
        divId={`${item.afid}--item-div`}
        className={
          `${state.active}--item-div` === `${item.afid}--item-div` ? 'item active' : 'item'
        }
        ref={state.tracks.length === index + 1 ? lastTrackElement : scrollToView}
        href={item.afid}
        id={item.afid}
        like={item.like}
        audiofile={item.audiofile}
        val={index}
        flashDiv={flashDiv.id}
        showContextMenu={handleContextMenu}
        artist={item.artist ? item.artist : 'not available'}
        title={item.title ? item.title : item.audiofile}
        album={item.album ? item.album : 'not available'}
        genre={item.genre ? item.genre : 'not available'}
        lossless={item.lossless === 1 ? 'true' : 'false'}
        bitrate={item.bitrate ? item.bitrate : 'not available'}
        samplerate={item.samplerate ? item.samplerate : 'not available'}
      />
    );
  });

  const byAlbums = state.albums.map((item, index) => {
    return (
      <Item
        type="folder"
        key={getKey()}
        id={item.id}
        className="item"
        ref={state.albums.length === index + 1 ? lastAlbumElement : scrollToView}
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
      ></Item>
    );
  });
  let pl;
  state.playlistShuffle ? (pl = shuffledPlaylist) : (pl = state.playlistTracks);
  const byPlaylist = pl.map((item, index) => {
    return (
      <Item
        type="playlist"
        key={getKey()}
        divId={`${item.afid}--item-div`}
        className={
          `${state.active}--item-div` === `${item.afid}--item-div` ? 'item active' : 'item'
        }
        href={item.afid}
        id={item.afid}
        like={item.like}
        audiofile={item.audiofile}
        val={index}
        showContextMenu={handleContextMenu}
        artist={item.artist ? item.artist : 'not available'}
        title={item.title ? item.title : item.audiofile}
        album={item.album ? item.album : 'not available'}
      />
    );
  });

  const listClassNames = () => {
    if (!state.library) {
      return 'results results-hidden';
    }
    if (state.library && !state.minimalmode) {
      return 'results';
    }
    if (state.library && state.minimalmode) {
      return 'results results-minimal';
    }
  };

  return (
    <>
      {state.library === true ? (
        <MediaMenu
          isFilesSortSelected={isFilesSortSelected}
          isAlbumsSortSelected={isAlbumsSortSelected}
          handleSortClick={handleSortClick}
          handleTextSearch={handleTextSearch}
          handlePlaylistFiles={handlePlaylistFiles}
          playlistShuffle={state.playlistShuffle}
        />
      ) : null}
      <div className={listClassNames()}>
        {state.listType === 'files' && !state.tracks.length && !tracksLoading ? (
          <div className="noresults">No results</div>
        ) : null}
        {state.listType === 'albums' && !state.albums.length && !albumsLoading ? (
          <div className="noresults">No results</div>
        ) : null}
        {state.listType === 'playlist' && !state.playlistTracks.length ? (
          <div className="noresults">No current playlist</div>
        ) : null}
        {state.listType === 'files' && (
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
        {state.listType === 'albums' && (
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
        {state.listType === 'playlist' && (
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
        {state.listType === 'files'
          ? tracksLoading && <div className="item itemloading">...Loading</div>
          : null}
        {state.listType === 'albums'
          ? albumsLoading && <div className="item itemloading">...Loading</div>
          : null}
      </div>
    </>
  );
};

export default InfiniteList;
