import { useState, useRef, useCallback, useEffect, forwardRef, useMemo } from 'react';
import classNames from 'classnames';
import { useAudioPlayer } from '../AudioPlayerContext';
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useAllAlbumsCovers } from '../hooks/useDb';
import handleTrackSelect from '../utility/audioUtils';
import { AlbumArt } from '../utility/AlbumArt';
import { BsThreeDots } from 'react-icons/bs';
import { GiPauseButton, GiPlayButton } from 'react-icons/gi';
import { FaStop } from 'react-icons/fa';
import NoImage from '../assets/noimage.jpg';
import { useVirtualizer } from '@tanstack/react-virtual';
import { openChildWindow } from './ChildWindows/openChildWindow';
import '../style/AlbumsCoverView.css';

const AlbumsCoverView = ({ resetKey, coverSize, className }) => {
  const { state, dispatch } = useAudioPlayer();
  /* const [coverPath, setCoverPath] = useState('');
  const [albumPath, setAlbumPath] = useState({ pathToAlbum: '', album: '' }); */
  const [menu, setMenu] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [currentAlbum, setCurrentAlbum] = useState('');
  const [isScrolling, setIsScrolling] = useState(false); // State to control scrolling

  const { coversLoading, hasMoreCovers, coversError } = useAllAlbumsCovers(
    state.coversPageNumber,
    state.coversSearchTerm,
    state.coversDateSort,
    state.coversMissingReq,
    dispatch,
    resetKey,
    state.covers.length
  );

  const parentRef = useRef(null);
  const coversObserver = useRef();

  const getEstimatedSize = useCallback(() => {
    return coverSize === 1 ? 100 : coverSize === 2 ? 150 : 200;
  }, [coverSize]);

  const gap = 10;

  const calculateLayout = useCallback(() => {
    const estimatedSize = getEstimatedSize();
    const columns = Math.max(1, Math.floor((containerSize.width + gap) / (estimatedSize + gap)));
    const rows = Math.ceil(state.covers.length / columns);
    return { columns, rows, estimatedSize };
  }, [containerSize.width, getEstimatedSize, state.covers.length]);

  const { columns, rows, estimatedSize } = useMemo(() => calculateLayout(), [calculateLayout]);

  /*   useEffect(() => {
    const handleResize = () => {
      if (parentRef.current) {
        setContainerSize({
          width: parentRef.current.offsetWidth,
          height: parentRef.current.offsetHeight
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [parentRef]); */

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (parentRef.current) {
        setContainerSize({
          width: parentRef.current.offsetWidth,
          height: parentRef.current.offsetHeight
        });
      }
    });

    if (parentRef.current) {
      resizeObserver.observe(parentRef.current);
    }

    return () => {
      if (parentRef.current) {
        resizeObserver.unobserve(parentRef.current);
      }
    };
  }, [parentRef, containerSize]);

  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedSize + gap,
    horizontal: false
  });

  useEffect(() => {
    if (state.covers.length) {
      rowVirtualizer.measure();
    }
  }, [state.covers.length, rowVirtualizer]);

  // Function to start continuous scrolling
  const startScrolling = useCallback(() => {
    setIsScrolling(true); // Set the scrolling state to true
  }, []);

  const stopScrolling = useCallback(() => {
    setIsScrolling(false); // Set the scrolling state to false
  }, []);

  useEffect(() => {
    let scrollInterval; // Variable to hold the scroll interval

    if (isScrolling && parentRef.current) {
      // Check if scrolling is enabled and the container is available
      scrollInterval = setInterval(() => {
        if (parentRef.current) {
          parentRef.current.scrollBy(0, 1); // Scroll the container down by 1 pixel
        }
      }, 1); // Adjust the interval time to control scroll speed (20ms)
    }

    return () => clearInterval(scrollInterval); // Clean up interval when component unmounts or scrolling stops
  }, [isScrolling]); // Re-run the effect when the `isScrolling` state changes

  const handleCoverSearch = async (search) => {
    console.log('search: ', search);
    const { album, path, service } = search;

    let artist, title;
    if (album.includes('-')) {
      [artist, title] = album
        .split('-')
        .map((part) => part.replaceAll(/\W/g, ' ').replaceAll('and', ' '));
    } else {
      title = album;
    }

    /*   if (!artist) return; */

    if (service === 'covit') {
      return openChildWindow(
        'cover-search-alt',
        'cover-search-alt',
        {
          width: 1400,
          height: 600,
          show: false,
          resizable: true,
          preload: 'coverSearchAlt',
          sandbox: true,
          webSecurity: true,
          contextIsolation: true
        },
        { artist, title, path }
      );
    }
  };

  const handleAlbumToPlaylist = async (path) => {
    const albumTracks = await window.api.getAlbumTracks(path);
    if (albumTracks) {
      dispatch({
        type: 'play-album',
        playlistTracks: albumTracks
      });
    }
  };

  const handlePlayReq = async (e) => {
    e.preventDefault();
    //console.log('album id: ', e.currentTarget.id);
    if (currentAlbum === e.currentTarget.id) {
      setCurrentAlbum('');
      state.audioRef.current.src = '';
      dispatch({
        type: 'stop-this-album'
      });
      /* audioRef.current.pause(); */
      dispatch({
        type: 'newtrack',
        pause: true,
        newtrack: '',
        artist: '',
        title: '',
        album: '',
        active: '',
        nextTrack: '',
        prevTrack: ''
      });
      return;
    }
    setCurrentAlbum(e.currentTarget.id);
    const albumPath = e.currentTarget.getAttribute('fullpath');
    const albumTracks = await window.api.getAlbumTracks(albumPath);
    if (albumTracks) {
      console.log('album-tracks: ', albumTracks);
      dispatch({
        type: 'play-this-album',
        playlistTracks: albumTracks,
        list: 'playlistActive'
        /* pause: false */
      });
      handleTrackSelect(e, state, dispatch, {
        artist: albumTracks[0].performers ? albumTracks[0].performers : 'not available',
        title: albumTracks[0].title ? albumTracks[0].title : albumTracks[0].audiotrack,
        album: albumTracks[0].album ? albumTracks[0].album : 'not available',
        audiofile: albumTracks[0].audiotrack,
        like: albumTracks[0].like,
        active: albumTracks[0].track_id,
        list: 'playlistActive'
      });
      setTimeout(() => dispatch({ type: 'start-album' }));
    }
  };

  const handleContextMenu = (option) => {
    const [menuoption, path, album] = option;
    console.log(menuoption, '---', path, '---', album);

    switch (menuoption) {
      case 'add album to playlist': {
        return handleAlbumToPlaylist(path);
        break;
      }
      case 'open album folder': {
        return window.api.openAlbumFolder(path);
        break;
      }
      case 'cover search': {
        const regex = /(\([^)]*\)|\[[^\]]*\]|\{[^}]*\})/g;
        const refAlbum = album.replace(regex, '');
        return handleCoverSearch({ path: path, album: refAlbum, service: 'covit' });
        break;
      }
      default:
        return;
    }
  };

  /*   useEffect(() => {
    window.api.onAlbumCoverMenu(handleContextMenu);
    return () => {
      window.api.off('album-menu', handleContextMenu);
    };
  }, []); */

  const showContextMenu = async (e) => {
    /* window.api.showContextMenu(); */
    e.preventDefault();
    const path = e.currentTarget.getAttribute('fullpath');
    const folder = e.currentTarget.getAttribute('album');
    console.log('path: ', path, 'folder: ', folder);
    await window.api.showAlbumCoverMenu(path, folder);
    await window.api.onAlbumCoverMenu((e) => handleContextMenu(e));
  };

  const lastCoverElement = useCallback(
    (node) => {
      if (coversLoading) return;
      if (coversObserver.current) coversObserver.current.disconnect();
      coversObserver.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreCovers) {
            dispatch({
              type: 'set-covers-pagenumber',
              coversPageNumber: state.coversPageNumber + 1
            });
          }
        },
        {
          root: document.querySelector('.albums-coverview'),
          threshold: 0.5
        }
      );
      if (node) coversObserver.current.observe(node);
    },
    [coversLoading, hasMoreCovers]
  );

  useEffect(() => {
    if (!coversObserver.current && state.covers.length > 0) {
      dispatch({
        type: 'set-covers-pagenumber',
        coversPageNumber: state.coversPageNumber + 1
      });
    }
  }, [coversObserver]);

  const coverImageSize = classNames('cover-image', {
    'image-small': coverSize === 1,
    'image-medium': coverSize === 2,
    'image-large': coverSize === 3
  });

  const coverTextSize = classNames('overlay-text', {
    'text-small': coverSize === 1,
    'text-medium': coverSize === 2,
    'text-large': coverSize === 3
  });

  return (
    <div
      ref={parentRef}
      className={className}
      style={{
        /* height: '100%', */
        width: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        maxHeight: '100vh',
        maxWidth: '100vw'
      }}
    >
      <div
        /* ref={index >= rows - 5 ? lastCoverElement : null} */
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            data-index={virtualRow.index}
            ref={virtualRow.index === rows - 1 ? lastCoverElement : null}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, ${estimatedSize}px)`,
                gap: `${gap}px`,
                justifyContent: 'center'
              }}
            >
              {Array.from({ length: columns }).map((_, columnIndex) => {
                const itemIndex = virtualRow.index * columns + columnIndex;
                const item = state.covers[itemIndex];
                if (!item) return;

                return (
                  <div
                    className="imagediv"
                    id={item.id}
                    key={itemIndex}
                    style={{
                      width: `${estimatedSize}px`,
                      height: `${estimatedSize}px`,
                      position: 'relative'
                    }}
                  >
                    {item.img ? (
                      <img className={coverImageSize} src={`cover://${item.img}`} alt="" />
                    ) : (
                      <img className={coverImageSize} src={NoImage} alt="" />
                    )}
                    <div className={currentAlbum !== item.id ? 'overlay' : 'overlay active-album'}>
                      <span className={coverTextSize} id={item.fullpath}>
                        {item.foldername}
                      </span>
                      <div
                        className="item-menu"
                        id={item.fullpath}
                        fullpath={item.fullpath}
                        album={item.foldername}
                      >
                        <BsThreeDots
                          /*  onClick={async () =>
                            await window.api.showAlbumCoverMenu(item.fullpath, item.foldername)
                          } */
                          onClick={showContextMenu}
                          //async () => {async () => await window.api.showAlbumCoverMenu()}
                          id={item.fullpath}
                          fullpath={item.fullpath}
                          album={item.foldername}
                        />
                      </div>
                      <span
                        id={item.id}
                        fullpath={item.fullpath}
                        onClick={handlePlayReq}
                        style={{ alignSelf: 'end' }}
                      >
                        {currentAlbum === item.id ? <FaStop /> : <GiPlayButton />}
                      </span>
                    </div>
                  </div>
                );
              })}
              {coversLoading && hasMoreCovers && (
                <div
                  style={{
                    width: `${estimatedSize}px`,
                    height: `${estimatedSize}px`,
                    zIndex: '100',
                    backgroundColor: 'var(--blue2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  Loading
                </div>
              )}
              {coversError && (
                <div
                  style={{
                    width: `${estimatedSize}px`,
                    height: `${estimatedSize}px`,
                    zIndex: '100',
                    backgroundColor: 'red',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  Errors loading covers
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlbumsCoverView;
