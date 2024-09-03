import { useState, useRef, useCallback, useEffect, forwardRef, useMemo } from 'react';
import classNames from 'classnames';
import { useAudioPlayer } from '../AudioPlayerContext';
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useAllAlbumsCovers } from '../hooks/useDb';
import { AlbumArt } from '../utility/AlbumArt';
import { BsThreeDots } from 'react-icons/bs';
import { GiPauseButton, GiPlayButton } from 'react-icons/gi';
import NoImage from '../assets/noimage.jpg';
import { useVirtualizer } from '@tanstack/react-virtual';
import { openChildWindow } from './ChildWindows/openChildWindow';
import '../style/VirtualGrid.css';

const AlbumsCoverView = ({ resetKey, coverSize }) => {
  const { state, dispatch } = useAudioPlayer();
  const [coverPath, setCoverPath] = useState('');
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isScrolling, setIsScrolling] = useState(false); // State to control scrolling
  const [enabled, setEnabled] = useState(false);

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

  /*   useEffect(() => {
    if (!enabled) {
      setEnabled(true);
    }
  }, []); */

  const getEstimatedSize = useCallback(() => {
    return coverSize === 1 ? 100 : coverSize === 2 ? 150 : 200;
  }, [coverSize]);

  const gap = 10;

  const calculateLayout = useCallback(() => {
    const estimatedSize = getEstimatedSize();
    //const columns = Math.floor((containerSize.width + gap) / (estimatedSize + gap));
    const columns = Math.max(1, Math.floor((containerSize.width + gap) / (estimatedSize + gap)));
    const rows = Math.ceil(state.covers.length / columns);
    return { columns, rows, estimatedSize };
  }, [containerSize.width, getEstimatedSize, state.covers.length]);

  const { columns, rows, estimatedSize } = useMemo(() => calculateLayout(), [calculateLayout]);

  useEffect(() => {
    const handleResize = () => {
      if (parentRef.current) {
        setContainerSize({
          width: parentRef.current.offsetWidth,
          height: parentRef.current.offsetHeight
        });
      }
    };

    handleResize(); // Initial calculation
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedSize + gap,
    /*  overscan: 5, */
    //isScrolling: (event) => console.log(event),
    horizontal: false
    /* enabled,
    debug: true */
  });

  useEffect(() => {
    if (state.covers.length) {
      rowVirtualizer.measure();
    }
  }, [state.covers.length, rowVirtualizer]);

  useEffect(() => {
    // Restore scroll position when the component mounts
    const savedScrollPosition = localStorage.getItem('scrollPosition');
    if (savedScrollPosition) {
      parentRef.current.scrollTop = parseInt(savedScrollPosition, 10);
    }

    // Save scroll position when the tab visibility changes
    const handleVisibilityChange = () => {
      console.log('visibility: ', document.visibilityState);
      if (document.visibilityState === 'hidden') {
        localStorage.setItem('scrollPosition', parentRef.current.scrollTop);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Clear scroll position from local storage when component unmounts
      localStorage.removeItem('scrollPosition');
    };
  }, []);

  useEffect(() => {
    console.log('rows: ', rows);
  }, [rows]);

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
    const { album, path, service } = search;

    let artist, title;
    if (album.includes('-')) {
      [artist, title] = album
        .split('-')
        .map((part) => part.replaceAll(/\W/g, ' ').replaceAll('and', ' '));
    } else {
      title = album;
    }

    if (!artist) return;

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
    const albumPath = e.currentTarget.getAttribute('fullpath');
    const albumTracks = await window.api.getAlbumTracks(albumPath);
    if (albumTracks) {
      dispatch({
        type: 'play-album',
        playlistTracks: albumTracks
      });
    }
  };

  const handleContextMenuOption = async (option, path, album) => {
    console.log('option: ', option);
    if (option[0] === 'search for cover') {
      const regex = /(\([^)]*\)|\[[^\]]*\]|\{[^}]*\})/g;

      const refAlbum = album.replace(regex, '');
      /*       console.log('album: ', album, 'refAlbum: ', refAlbum); */
      handleCoverSearch({ path: path, album: refAlbum });
      /* setCoverSearch({ path: path, album: refAlbum.join(' ') }); */
    } else if (option[0] === 'add album to playlist') {
      handleAlbumToPlaylist(path);
    } else if (option[0] === 'open album folder') {
      await window.api.openAlbumFolder(path);
    } else if (option[0] === 'cover search') {
      /* console.log('cover - search - engine', option, 'path: ', path, 'album: ', album); */
      const regex = /(\([^)]*\)|\[[^\]]*\]|\{[^}]*\})/g;
      const refAlbum = album.replace(regex, '');
      handleCoverSearch({ path: path, album: refAlbum, service: 'covit' });
    }
  };

  const handleContextMenu = async (e) => {
    e.preventDefault();
    const pathToAlbum = e.currentTarget.getAttribute('fullpath');
    const album = e.currentTarget.getAttribute('album');
    await window.api.showAlbumCoverMenu();
    await window.api.onAlbumCoverMenu((e) => handleContextMenuOption(e, pathToAlbum, album));
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

  /*   useEffect(() => {
    if (!coversObserver.current && state.covers.length > 0) {
      dispatch({
        type: 'set-covers-pagenumber',
        coversPageNumber: state.coversPageNumber + 1
      });
    }
  }, [coversObserver]); */

  const albumsGridName = classNames('albums-coverview--albums', {
    'grid-small': coverSize === 1,
    'grid-medium': coverSize === 2,
    'grid-large': coverSize === 3
  });

  const coverImageSize = classNames('cover-image', {
    'image-small': coverSize === 1,
    'image-medium': coverSize === 2,
    'image-large': coverSize === 3
  });

  /*   const lastItemCalled = (item) => {
    coverRef.current = item;
  }; */

  return (
    <div
      ref={parentRef}
      className="albums-coverview"
      style={{
        height: '100%',
        width: '100%',
        overflow: 'auto'
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
            ref={virtualRow.index >= rows - 5 ? lastCoverElement : null}
            //ref={rowVirtualizer.measureElement}

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
                    <div className="overlay">
                      <span id={item.fullpath}>{item.foldername}</span>
                      <div
                        className="item-menu"
                        id={item.fullpath}
                        fullpath={item.fullpath}
                        album={item.foldername}
                      >
                        <BsThreeDots
                          onClick={handleContextMenu}
                          id={item.fullpath}
                          fullpath={item.fullpath}
                          album={item.foldername}
                        />
                      </div>
                      <span id="coverplay" fullpath={item.fullpath} onClick={handlePlayReq}>
                        <GiPlayButton />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {/* {coversLoading && <div>Loading more...</div>}
      {coversError && <div>Error loading covers: {coversError}</div>} */}
    </div>
  );
};

export default AlbumsCoverView;
