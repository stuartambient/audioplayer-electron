import { useState, useRef, useCallback, useEffect } from 'react';
import { GiMagnifyingGlass } from 'react-icons/gi';
import { ArchiveAdd, Playlist, Shuffle, Plus, Minus } from '../assets/icons';
import { v4 as uuidv4 } from 'uuid';
import { useTracks, useAlbums, useAlbumTracks } from '../hooks/useDb';
import Switch from './Switch';
import '../style/InfiniteList.css';

const InfiniteList = ({
  onClick,
  currentTrack,
  setCurrentTrack,
  playNext,
  playPrev,
  nextTrack,
  prevTrack,
  active,
  dispatch,
  handlePicture,
  library
}) => {
  const [tracksPageNumber, setTracksPageNumber] = useState(0);
  const [albumsPageNumber, setAlbumsPageNumber] = useState(0);
  const [type, setType] = useState('files');
  const [tracksSearchTerm, setTracksSearchTerm] = useState('');
  const [albumsSearchTerm, setAlbumsSearchTerm] = useState('');
  const [randomize, setRandomize] = useState(false);
  const [albumPattern, setAlbumPattern] = useState('');
  const [showMore, setShowMore] = useState(null);
  const { tracksLoading, tracks, setTracks, hasMoreTracks, tracksError } = useTracks(
    tracksPageNumber,
    tracksSearchTerm
  );
  const { albumsLoading, albums, setAlbums, hasMoreAlbums, albumsError } = useAlbums(
    albumsPageNumber,
    albumsSearchTerm
  );

  /*  const { albumTracks, setAlbumTracks } = useAlbumTracks(albumPattern); */

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
      setTracks([]);
      setTracksSearchTerm(e.currentTarget.textsearch.value);
      setTracksPageNumber(0);
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

  const handleScanRequest = () => {
    if (library) {
      dispatch({
        type: 'library'
      });
    }
  };
  const handleListScroll = (e) => {};

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
    /*   showMore === e.currentTarget.id
      ? setShowMore(null)
      : setShowMore(e.currentTarget.id);
    setAlbumPath(term); */
  };

  const randomizeIcon = useRef(null);

  const handleRandomize = (e) => {
    setRandomize(!randomize);
    /* randomizeIcon.current.classlist.toggle("icon-on"); */

    if (e.target.classList.contains('menu-icons-active')) {
      e.target.classList.remove('menu-icons-active');
    } else {
      e.target.classList.add('menu-icons-active');
    }
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
            /* console.log('entries: ', entries[0].isIntersecting, hasMore); */
            setTracksPageNumber((prevTrackNumber) => prevTrackNumber + 1);
            /*    dispatch({
              type: "filesPageNumber",
            }); */
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
      <div
        key={getKey()}
        id={`${item.afid}--item-div`}
        className={`${active}--item-div` === `${item.afid}--item-div` ? 'item active' : 'item'}
        ref={tracks.length === index + 1 ? lastTrackElement : scrollToView}
      >
        <a
          href={item.afid}
          id={item.afid}
          val={index}
          onClick={(e) => onClick(e, item.artist, item.title, item.album, item.picture)}
        >
          Artist: {item.artist ? item.artist : 'not available'}
          <br></br>
          Title: {item.title ? item.title : 'not available'}
          <br></br>
          Album: {item.album ? item.album : 'not available'}>
        </a>
      </div>
    );
  });

  const byAlbums = albums.map((item, index) => {
    return (
      <div
        key={getKey()}
        id={item._id}
        className="item"
        ref={albums.length === index + 1 ? lastAlbumElement : scrollToView}
      >
        <a
          /* type="input"
          href="#" */
          href="http://"
          id={item._id}
          val={index}
          /* onClick={handleAlbumTracksRequest} */
          style={{ color: 'white', cursor: 'pointer' }}
        >
          {item.foldername}
        </a>
        <div id={item._id} term={item.fullpath} onClick={handleAlbumTracksRequest}>
          {showMore === item._id ? <Minus id="minus" /> : <Plus id="plus" />}
        </div>
        {albumPattern === item.fullpath && albumTracks.length ? (
          <ul className="albumtracks">{albumsTracks}</ul>
        ) : null}
      </div>
    );
  });

  return (
    <>
      <ul className="search-menu">
        <li>
          <Switch type={type} setType={setType} />
        </li>
        <li>
          <div className="form">
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
          </div>
        </li>
      </ul>

      <div className="results">
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
