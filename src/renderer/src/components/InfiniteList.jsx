import { useState, useRef, useCallback, useEffect, forwardRef, memo, useMemo } from 'react';
import { useAudioPlayer } from '../AudioPlayerContext';
import { ArchiveAdd, Playlist, Shuffle, Plus, Minus } from '../assets/icons';
import { v4 as uuidv4 } from 'uuid';
import { Virtuoso } from 'react-virtuoso';
import MediaMenu from './MediaMenu';
import Item from './Item';
import {
  useTracks,
  useAlbums,
  useAlbumTracks,
  usePlaylist,
  usePlaylistDialog
  /* useAllAlbumsCovers */
  /*   useRandomTracks */
} from '../hooks/useDb';
import '../style/InfiniteList.css';

const InfiniteList = memo(() => {
  const { state, dispatch } = useAudioPlayer();
  const [tracksSearchTerm, setTracksSearchTerm] = useState('');
  const [albumsSearchTerm, setAlbumsSearchTerm] = useState('');

  const [albumPattern, setAlbumPattern] = useState('');
  const [showMore, setShowMore] = useState(null);
  const [filesSortType, setFilesSortType /* scrollRef */] = useState('createdon');
  const [albumsSortType, setAlbumsSortType /* scrollRef */] = useState('datecreated');
  const [resetKey, setResetKey] = useState(null);
  const [shuffledPlaylist, setShuffledPlaylist] = useState([]);
  const [isScrolling, setIsScrolling] = useState(true);

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

  const [contSize, setContSize] = useState(0);

  const { albumTracks, setAlbumTracks } = useAlbumTracks(albumPattern);

  const fileslistRef = useRef(null);
  const playlistRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    console.log('hasMoreAlbums: ', hasMoreAlbums);
  }, [hasMoreAlbums]);

  useEffect(() => {
    if (resultsRef.current) {
      const handleResize = () => {
        const contDimension = resultsRef.current.getBoundingClientRect();
        setContSize(contDimension);
      };

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(resultsRef.current);

      // Cleanup function to disconnect the observer on unmount
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [resultsRef]);

  useEffect(() => {
    if (state.flashDiv?.id) {
      const timer = setTimeout(() => {
        dispatch({
          type: 'reset-flash-div'
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state.flashDiv]);

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
    if (track.title) {
      return (
        <li key={track.track_id} className="albumtrack">
          <span>Disc: {track.disc}</span>{' '}
          <span>
            Track: {track.track} of {track.trackCount}
          </span>
          <a href={track.audiotrack}>{track.title}</a>
        </li>
      );
    } else {
      return (
        <li key={track.track_id} className="albumtrack">
          <a href={track.audiotrack}>{track.audiotrack}</a>
        </li>
      );
    }
  });

  const scrollRef = useRef();

  useEffect(() => {
    const setTrackNavigation = (tracksArray) => {
      if (state.newtrack >= 0 && tracksArray[state.newtrack + 1]) {
        dispatch({
          type: 'set-next-track',
          nextTrack: tracksArray[state.newtrack + 1].track_id
        });
      }
      if (state.newtrack >= 1 && tracksArray[state.newtrack - 1]) {
        dispatch({
          type: 'set-prev-track',
          prevTrack: tracksArray[state.newtrack - 1].track_id
        });
      }
    };

    if (state.listType === 'files') {
      setTrackNavigation(state.tracks);
    } else if (state.listType === 'playlist' /*  && !state.playlistShuffle */) {
      setTrackNavigation(state.playlistTracks);
    } /* else if (state.playlistShuffle) {
      setTrackNavigation(shuffledPlaylist);
    } */
  }, [
    state.newtrack,
    state.tracks,
    state.playlistTracks,
    /*     shuffledPlaylist, */
    state.listType
    /*     dispatch */
  ]);

  /*   useEffect(() => {
    if (state.listType === 'files') {
      if (state.newtrack >= 0 && state.tracks[+state.newtrack + 1]) {
        dispatch({
          type: 'set-next-track',
          nextTrack: state.tracks[+state.newtrack + 1].track_id
        });
      }
      if (state.newtrack >= 1 && state.tracks[+state.newtrack - 1]) {
        dispatch({
          type: 'set-prev-track',
          prevTrack: state.tracks[+state.newtrack - 1].track_id
        });
      }
    }
    if (state.listType === 'playlist' ) {
      if (state.newtrack >= 0 && state.playlistTracks[state.newtrack + 1]) {
        dispatch({
          type: 'set-next-track',
          nextTrack: state.playlistTracks[+state.newtrack + 1].track_id
        });
      }
      if (state.newtrack >= 1 && state.playlistTracks[state.newtrack - 1]) {
        dispatch({
          type: 'set-prev-track',
          prevTrack: state.playlistTracks[+state.newtrack - 1].track_id
        });
      }
    } */
  /*  if (state.playlistShuffle) {
      if (state.newtrack >= 0 && shuffledPlaylist[+state.newtrack + 1]) {
        dispatch({
          type: 'set-next-track',
          nextTrack: shuffledPlaylist[+state.newtrack + 1].track_id
        });
      }
      if (state.newtrack >= 1 && shuffledPlaylist[+state.newtrack - 1]) {
        dispatch({
          type: 'set-prev-track',
          prevTrack: shuffledPlaylist[+state.newtrack - 1].track_id
        });
      }
    } */
  /*   }, [
    state.newtrack,
    state.tracks,
    state.playlistTracks,
    state.listType,
    dispatch
  ]); */

  useEffect(() => {
    const handleTrackChange = (trackId) => {
      const changeTrack = new Event('click', {
        bubbles: true,
        cancelable: false
      });

      const toTrack = document.getElementById(trackId);
      if (toTrack) {
        toTrack.dispatchEvent(changeTrack);
      } else {
        console.error(`Element with ID ${trackId} not found in the DOM.`);
      }
    };

    if (state.playNext && state.nextTrack && state.listType === 'files') {
      fileslistRef.current.scrollToIndex({
        index: Number(`${state.newtrack + 1}`),
        behavior: 'smooth',
        align: 'center'
      });
      handleTrackChange(state.nextTrack);
    }
    if (state.playPrev && state.prevTrack && state.listType === 'files') {
      fileslistRef.current.scrollToIndex({
        index: Number(`${state.newtrack - 1}`),
        behavior: 'smooth',
        align: 'center'
      });
      handleTrackChange(state.prevTrack);
    }

    if (state.playNext && state.nextTrack && state.listType === 'playlist') {
      playlistRef.current.scrollToIndex({
        index: Number(`${state.newtrack + 1}`),
        behavior: 'smooth',
        align: 'center'
      });
      handleTrackChange(state.nextTrack);
    }
    if (state.playPrev && state.prevTrack && state.listType === 'playlist') {
      playlistRef.current.scrollToIndex({
        index: Number(`${state.newtrack - 1}`),
        behavior: 'smooth',
        align: 'center'
      });
      handleTrackChange(state.prevTrack);
    }
  }, [
    state.playNext,
    state.nextTrack,
    state.playPrev,
    state.prevTrack,
    state.tracks,
    state.nextTrack,
    fileslistRef
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
      setFilesSortType(e.currentTarget.value);
    } else if (state.listType === 'albums') {
      dispatch({
        type: 'albums-pagenumber',
        albumsPageNumber: 0
      });
      dispatch({
        type: 'reset-albums',
        albums: []
      });
      setAlbumsSortType(e.currentTarget.value);
    }
  };

  const getKey = () => uuidv4();

  /*   const filesObserver = useRef();
  const albumsObserver = useRef();
  const playlistObserver = useRef(); */

  const albumslistRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0); // Track the current index

  /*   useEffect(() => {
    const interval = setInterval(() => {
      if (fileslistRef.current) {
        fileslistRef.current.scrollToIndex({
          index: currentIndex, 
          behavior: 'smooth'
        });

        setCurrentIndex((prevIndex) => prevIndex + 1); 
      }
    }, 200); 

    return () => clearInterval(interval); 
  }, [currentIndex]); */

  const loadMoreTracks = () => {
    if (!hasMoreTracks) return;

    dispatch({
      type: 'tracks-pagenumber',
      tracksPageNumber: state.tracksPageNumber + 1
    });
  };

  const loadMoreAlbums = () => {
    if (!hasMoreAlbums) return;
    dispatch({
      type: 'albums-pagenumber',
      albumsPageNumber: state.albumsPageNumber + 1
    });
  };

  const listClassNames = () => {
    if (
      state.player &&
      !state.library &&
      !state.update &&
      !state.home &&
      !state.tagEditor &&
      !state.minimalmode
    ) {
      return 'results results-hidden results-centered';
    }
    if (!state.library && state.player && state.minimalmode) {
      return 'results results-hidden results-hidden-minimal';
    }
    if (
      (!state.library && state.player) ||
      (!state.library && state.update) ||
      (!state.library && state.home) ||
      (!state.library && state.tagEditor)
    ) {
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
          /* playlistShuffle={state.playlistShuffle} */
        />
      ) : null}
      <div className={listClassNames()} ref={resultsRef}>
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
            <div className="files">
              <Virtuoso
                className="files-list"
                style={{ height: `${contSize.height}px` }}
                ref={fileslistRef}
                data={state.tracks}
                totalCount={state.tracks.length}
                endReached={loadMoreTracks}
                components={{
                  Footer: () => {
                    if (tracksLoading) {
                      return <div className="item itemloading">Loading...</div>;
                    }
                    if (tracksError) {
                      return <div className="item trackserror">{tracksError}</div>;
                    }
                    if (!hasMoreTracks) {
                      return <div className="item hasmoretracks">No more tracks available.</div>;
                    }
                    return null; // No footer if none of the states apply
                  }
                }}
                /* components={{ Scroller: CustomScroller }} */
                itemContent={(index, item) => {
                  if (!item) return null; // Handle empty items

                  return (
                    <Item
                      type="file"
                      key={getKey()}
                      divId={`${item.track_id}--item-div`}
                      className={
                        `${state.active}--item-div` === `${item.track_id}--item-div`
                          ? 'item active'
                          : 'item'
                      }
                      href={item.track_id}
                      id={item.track_id}
                      like={item.like}
                      audiofile={item.audiotrack}
                      val={index}
                      artist={item.performers ? item.performers : 'not available'}
                      title={item.title ? item.title : item.audiotrack}
                      album={item.album ? item.album : 'not available'}
                      genre={item.genres ? item.genres : 'not available'}
                      codecs={item.codecs ? item.codecs : 'not available'}
                      bitrate={item.audioBitrate ? item.audioBitrate : 'not available'}
                      samplerate={item.audioSampleRate ? item.audioSampleRate : 'not available'}
                    />
                  );
                }}
              />
            </div>
            <div className="albums" style={{ display: 'none' }}></div>
            <div className="playlist" style={{ display: 'none' }}></div>
          </>
        )}
        {state.listType === 'albums' && (
          <>
            <div className="albums" /* ref={resultsRef} */>
              <Virtuoso
                data={state.albums}
                className="albums-list" /*  */
                style={{ height: `${contSize.height}px` }}
                /* ref={albumslistRef} */
                totalCount={state.albums.length}
                endReached={loadMoreAlbums}
                components={{
                  Footer: () => {
                    if (albumsLoading) {
                      return <div className="item itemloading">Loading...</div>;
                    }
                    if (albumsError) {
                      return <div className="item trackserror">{albumsError}</div>;
                    }
                    if (!hasMoreAlbums) {
                      return <div className="item hasmoretracks">No more results.</div>;
                    }
                    return null; // No footer if none of the states apply
                  }
                }}
                /* style={{ height: '390px' }} */
                itemContent={(index, item) => {
                  return (
                    <Item
                      type="folder"
                      key={getKey()}
                      id={item.id}
                      className="item"
                      href="http://"
                      val={index}
                      foldername={item.foldername}
                      term={item.fullpath}
                      fullpath={item.fullpath}
                      handleAlbumTracksRequest={handleAlbumTracksRequest}
                      /* showContextMenu={handleContextMenu} */
                      showMore={showMore}
                      albumPattern={albumPattern}
                      albumTracksLength={albumTracks.length}
                      albumsTracks={albumsTracks}
                    />
                  );
                }}
              />
            </div>

            <div className="files" style={{ display: 'none' }}></div>
            <div className="playlist" style={{ display: 'none' }}></div>
          </>
        )}
        {state.listType === 'playlist' && (
          <>
            <div className="playlist">
              <Virtuoso
                ref={playlistRef}
                data={state.playlistTracks}
                className="playlist-list"
                totalCount={state.playlistTracks.length}
                style={{ height: `${contSize.height}px` }}
                itemContent={(index, item) => {
                  return (
                    <Item
                      type="playlist"
                      key={getKey()}
                      divId={`${item.track_id}--item-div`}
                      className={
                        `${state.active}--item-div` === `${item.track_id}--item-div`
                          ? 'item active'
                          : 'item'
                      }
                      href={item.track_id}
                      id={item.track_id}
                      like={item.like}
                      audiofile={item.audiotrack}
                      val={index}
                      artist={item.performers ? item.performers : 'not available'}
                      title={item.title ? item.title : item.audiotrack}
                      album={item.album ? item.album : 'not available'}
                    />
                  );
                }}
              />
            </div>
            <div className="albums" style={{ display: 'none' }}></div>
            <div className="files" style={{ display: 'none' }}></div>
          </>
        )}
      </div>
    </>
  );
});

export default InfiniteList;
