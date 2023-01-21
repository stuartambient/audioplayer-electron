import { useState, useRef, useCallback, useEffect, forwardRef } from 'react';

import { ArchiveAdd, Playlist, Shuffle, Plus, Minus } from '../assets/icons';
import { v4 as uuidv4 } from 'uuid';
import MediaMenu from './MediaMenu';
import Item from './Item';
import { useTracks, useAlbums, useAlbumTracks } from '../hooks/useDb';
/* import Switch from './Switch'; */
import '../style/InfiniteList.css';

const InfiniteList = ({
  handleTrackSelection,
  currentTrack,
  setCurrentTrack,
  playNext,
  playPrev,
  nextTrack,
  prevTrack,
  active,
  dispatch,
  library,
  tracks,
  tracksPageNumber,
  minimalmode
}) => {
  const [albumsPageNumber, setAlbumsPageNumber] = useState(0);
  const [type, setType] = useState('files');
  const [tracksSearchTerm, setTracksSearchTerm] = useState('');
  const [albumsSearchTerm, setAlbumsSearchTerm] = useState('');
  const [albumPattern, setAlbumPattern] = useState('');
  const [showMore, setShowMore] = useState(null);
  const [sortType, setSortType] = useState('createdon');
  const { tracksLoading, hasMoreTracks, tracksError } = useTracks(
    tracksPageNumber,
    tracksSearchTerm,
    sortType,
    dispatch
  );
  const { albumsLoading, albums, setAlbums, hasMoreAlbums, albumsError } = useAlbums(
    albumsPageNumber,
    albumsSearchTerm
  );

  /*   const { albumTracks, setAlbumTracks } = useAlbumTracks(albumPattern); */

  /*   const albumsTracks = albumTracks.map((track) => {
    if (track.title) {
      return <li key={track.afid}>{track.title}</li>;
    } else {
      <li key={track.afid}>{track.audiofile}</li>;
    }
  }); */

  const scrollRef = useRef();
  const searchRef = useRef();

  useEffect(() => {
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
  }, [currentTrack, tracks, dispatch]);

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

  const handleTextSearch = (e) => {
    e.preventDefault();
    if (e.currentTarget.textsearch.value === '') return;
    if (type === 'files') {
      /* setTracks([]); */
      dispatch({
        type: 'reset-tracks',
        tracks: []
      });
      setTracksSearchTerm(e.currentTarget.textsearch.value);
      /* setTracksPageNumber(0); */
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
    }
    /* if (currentTrack) {
        const ifCurrentTrack = tracks.filter((f) => f.afid === active);
        setTracks(ifCurrentTrack);
      } else {
        setTracks([]); // if currentrack
      } */
    //} /* else {
    /*  setAlbumsSearchTerm(e.currentTarget.textsearch.value);
      setAlbumsPageNumber(0);
      setAlbums([]);
    } */
  };

  /*   const handleScanRequest = () => {
    if (library) {
      dispatch({
        type: 'library'
      });
    }
  }; */
  const handleListScroll = (e) => {};

  useEffect(() => {
    console.log('show more: ', showMore, 'albumPattern: ', albumPattern);
  }, [showMore, albumPattern]);

  const handleAlbumTracksRequest = (e) => {
    const term = e.currentTarget.getAttribute('term');

    if (showMore === e.currentTarget.id) {
      setShowMore(null);
      /*   setAlbumTracks([]); */
      setAlbumPattern(null);
    } else {
      setShowMore(e.currentTarget.id);
      setAlbumPattern(term);
    }
    /*  showMore === e.currentTarget.id ? setShowMore(null) : setShowMore(e.currentTarget.id);
    setAlbumPath(term); */
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
            setAlbumsPageNumber((prevPageNumber) => prevPageNumber + 1);
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
        handleTrackSelection={handleTrackSelection}
        artist={item.artist ? item.artist : 'not available'}
        title={item.title ? item.title : item.audiofile}
        album={item.album ? item.artist : 'not available'}
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
        showMore={showMore}
        albumPattern={albumPattern}
        /* albumTracksLength={albumTracks.length}
        albumTracks={albumTracks} */
      ></Item>
    );
  });

  const listClassNames = () => {
    if (!library) {
      return 'results--hidden';
    }
    if (library && !minimalmode) {
      return 'results';
    }
    if (library && minimalmode) {
      return 'results--minimal';
    }
  };

  return (
    <>
      {library === true ? (
        <MediaMenu
          isSortSelected={isSortSelected}
          handleSortClick={handleSortClick}
          type={type}
          setType={setType}
          handleTextSearch={handleTextSearch}
        />
      ) : null}
      <div className={listClassNames()}>
        {type === 'files' && !tracks.length && !tracksLoading ? (
          <div className="noresults">No results</div>
        ) : null}
        {type === 'albums' && !albums.length && !albumsLoading ? (
          <div className="noresults">No results</div>
        ) : null}
        {type === 'files' ? (
          <>
            <div className="files">{byFiles}</div>
            <div className="albums" style={{ display: 'none' }}>
              {byAlbums}
            </div>
          </>
        ) : (
          <>
            <div className="albums">{byAlbums}</div>
            <div className="files" style={{ display: 'none' }}>
              {byFiles}
            </div>
          </>
        )}
        {type === 'files'
          ? tracksLoading && <div className="item itemloading">...Loading</div>
          : null}
        {type === 'albums'
          ? albumsLoading && <div className="item itemloading">...Loading</div>
          : null}
      </div>
    </>
  );
};

export default InfiniteList;
