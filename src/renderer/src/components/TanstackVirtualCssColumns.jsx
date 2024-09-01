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
import ViewMore from '../assets/view-more-alt.jpg';
import { useVirtualizer } from '@tanstack/react-virtual';
import { openChildWindow } from './ChildWindows/openChildWindow';
import '../style/VirtualGrid.css';

const AlbumsCoverView = ({ resetKey, coverSize }) => {
  /* console.log('resetKey: ', resetKey); */
  const { state, dispatch } = useAudioPlayer();
  const [viewMore, setViewMore] = useState(false);
  const [coverPath, setCoverPath] = useState('');
  const [estSize, setEstSize] = useState(100);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

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

  const loadMoreCovers = () => {
    console.log('hmc: ', hasMoreCovers, 'cl: ', coversLoading);
    if (hasMoreCovers && !coversLoading) {
      console.log('Loading more covers...');
      dispatch({
        type: 'set-covers-pagenumber',
        coversPageNumber: state.coversPageNumber + 1
      });
    } else {
      console.log('Cannot load more covers:', { hasMoreCovers, coversLoading });
    }
  };

  useEffect(() => {
    console.log('has more covers: ', hasMoreCovers);
    console.log('covers loading: ', coversLoading);
  }, [hasMoreCovers, coversLoading]);

  /*   useEffect(() => {
    console.log('coverRef: ', coverRef.current);
    console.log(Number(coverRef.current) === Number(state.covers.length));
    if (Number(coverRef.current) === Number(state.covers.length)) {
      loadMoreCovers();
    }
  }, [coverRef.current]); */

  /*   useEffect(() => {
    console.log('hmc: ', hasMoreCovers, 'cl: ', coversLoading);
  }, [hasMoreCovers, coversLoading]); */
  /*   const coversObserver = useRef(); */
  /*  const columns = 6; */

  /*   useEffect(() => {
    setEstSize(coverSize === 1 ? 100 : coverSize === 2 ? 150 : 200);
  }, [coverSize]); */
  const getEstimatedSize = useCallback(() => {
    return coverSize === 1 ? 100 : coverSize === 2 ? 150 : 200;
  }, [coverSize]);

  const gap = 10; // Gap between items (both rows and columns)

  const calculateLayout = useCallback(() => {
    const estimatedSize = getEstimatedSize();
    //const columns = Math.floor((containerSize.width + gap) / (estimatedSize + gap));
    const columns = Math.max(1, Math.floor((containerSize.width + gap) / (estimatedSize + gap)));
    const rows = Math.ceil(state.covers.length / columns);
    console.log('rows: ', rows);
    return { columns, rows, estimatedSize };
  }, [containerSize.width, getEstimatedSize, state.covers.length]);

  const { columns, rows, estimatedSize } = useMemo(() => calculateLayout(), [calculateLayout]);

  /* const calculateColumns = useMemo(() => {
    if (containerWidth === 0) return 1;
    const gap = 10; // Adjust this value to match your grid gap
    return Math.floor((containerWidth + gap) / (estSize + gap));
  }, [containerWidth, estSize]); */

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
    /* overscan: 2, */
    isScrolling: (event) => console.log(event),
    horizontal: false
  });

  useEffect(() => {
    if (state.covers.length) {
      rowVirtualizer.measure();
    }
  }, [state.covers.length, rowVirtualizer]);

  useEffect(() => {
    console.log('number of rows: ', Math.ceil(state.covers.length / columns));
    console.log('number of items: ', rowVirtualizer.getVirtualItems());
  }, [rows, rowVirtualizer.getVirtualItems()]);

  /*   useEffect(() => {
    const lastRowIndex = rows - 1;
    const isLastRowVisible = rowVirtualizer
      .getVirtualItems()
      .some(
        (virtualRow) =>
          virtualRow.index === lastRowIndex && virtualRow.start < rowVirtualizer.getTotalSize()
      );

    if (isLastRowVisible) {
      console.log('Last row is visible');
    }
  }, [rows, rowVirtualizer]); */

  useEffect(() => {
    const lastItemIndex = state.covers.length - 1;
    const isLastItemVisible = rowVirtualizer
      .getVirtualItems()
      .some(
        (virtualRow) =>
          virtualRow.index === lastItemIndex && virtualRow.start < rowVirtualizer.getTotalSize()
      );

    if (isLastItemVisible) {
      console.log('Last item is visible');
    }
  }, [state.covers, rowVirtualizer]);

  /*  const rowCount = Math.ceil(state.covers.length / calculateColumns); */

  /* useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    const lastItem = virtualItems[virtualItems.length - 1];
    console.log('lastItem: ', lastItem, virtualItems);

    if (!lastItem) {
      console.log('No virtual items rendered yet');
      return;
    }

    const isNearEnd = lastItem.index >= rows - 5; // Load more when 5 rows from the end
    console.log('Scroll position:', { lastItemIndex: lastItem.index, totalRows: rows, isNearEnd });

    if (isNearEnd && hasMoreCovers && !coversLoading) {
      console.log('Near the end, triggering loadMoreCovers');
      loadMoreCovers();
    }
  }, [rowVirtualizer.getVirtualItems(), hasMoreCovers, coversLoading, rows, loadMoreCovers]); */

  /*   useEffect(() => {
    console.log('Number of items rendered:', rowVirtualizer.getVirtualItems().length);
  }, [rowVirtualizer.getVirtualItems()]); */

  /*   useEffect(() => {
    console.log(
      'Rendered items:',
      rowVirtualizer.getVirtualItems().map((item) => ({
        index: item.index,
        top: item.start,
        size: estSize
      }))
    );
  }, [rowVirtualizer.getVirtualItems()]); */

  /*   useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    console.log('lastItem: ', lastItem, '----', rows);
    if (!lastItem) return;
    if (lastItem.index < rows && hasMoreCovers && !coversLoading) {
      loadMoreCovers();
    }
  }, [rowVirtualizer.getVirtualItems(), hasMoreCovers, coversLoading, rows, loadMoreCovers]); */

  /*   useEffect(() => {
    console.log(
      'Rendered items:',
      rowVirtualizer.getVirtualItems().map((item) => {
        console.log('item: ', item);
      })
    );
  }, [rowVirtualizer.getVirtualItems()]); */

  /*   const totalRows = Math.ceil(state.covers.length / columns);
  const containerHeight = totalRows * (estSize + 10); */

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

  /*   const totalRows = Math.ceil(state.covers.length / columns);
  const containerHeight = totalRows * (estSize + 10); */

  const lastCoverElement = useCallback(
    (node) => {
      if (coversLoading) return;
      if (coversObserver.current) coversObserver.current.disconnect();
      coversObserver.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreCovers) {
            console.log('isIntersecting');
            dispatch({
              type: 'set-covers-pagenumber',
              coversPageNumber: state.coversPageNumber + 1
            });
          }
        },
        {
          root: document.querySelector('.albums-coverview'),
          threshold: 1
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
                    ref={itemIndex === rows - 1 ? lastCoverElement : null}
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
