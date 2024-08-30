import { useState, useRef, useCallback, useEffect, forwardRef } from 'react';
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
import '../style/AlbumsCoverViewXtra.css';

const AlbumsCoverView = ({ resetKey, coverSize }) => {
  /* console.log('resetKey: ', resetKey); */
  const { state, dispatch } = useAudioPlayer();
  const [viewMore, setViewMore] = useState(false);
  const [coverPath, setCoverPath] = useState('');
  const [estSize, setEstSize] = useState(100);

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
  const columns = 7;
  useEffect(() => {
    if (coverSize === 1) {
      setEstSize(100);
    } else if (coverSize === 2) {
      setEstSize(150);
    } else if (coverSize === 3) {
      setEstSize(200);
    }
  }, [coverSize, estSize]);

  const loadMoreCovers = () => {
    dispatch({
      type: 'set-covers-pagenumber',
      coversPageNumber: state.coversPageNumber + 1
    });
  };

  const rowVirtualizer = useVirtualizer({
    count: state.covers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estSize,
    overscan: 50
  });

  /*   useEffect(() => {
    console.log('Number of items rendered:', rowVirtualizer.getVirtualItems().length);
  }, [rowVirtualizer.getVirtualItems()]); */

  useEffect(() => {
    console.log(
      'Rendered items:',
      rowVirtualizer.getVirtualItems().map((item) => ({
        index: item.index,
        top: item.start,
        size: estSize
      }))
    );
  }, [rowVirtualizer.getVirtualItems()]);

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
            console.log('isIntersecting');
            dispatch({
              type: 'set-covers-pagenumber',
              coversPageNumber: state.coversPageNumber + 1
            });
          }
        },
        {
          root: document.querySelector('.albums-coverview--albums'),
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

  //return (

  return (
    <section
      ref={parentRef}
      className="albums-coverview"
      style={{ height: '100%', width: '100%', overflowY: 'auto' }}
    >
      <div
        /* className={albumsGridName} */
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          /* width: '100%', */
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowIndex = Math.floor(virtualRow.index / columns);
          const columnIndex = virtualRow.index % columns;
          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: `${rowIndex * estSize + 20}px`,
                left: `${columnIndex * estSize + 20}px`,
                width: `${estSize}px`,
                height: `${estSize}px`
              }}
            >
              {state.covers[virtualRow.index].img ? (
                <img
                  className={coverImageSize}
                  src={`cover://${state.covers[virtualRow.index].img}`}
                  alt=""
                />
              ) : (
                <img className={coverImageSize} src={NoImage} alt="" />
              )}
              <div className="overlay">
                <span id={state.covers[virtualRow.index].fullpath}>
                  {state.covers[virtualRow.index].foldername}
                </span>
                <div
                  className="item-menu"
                  id={state.covers[virtualRow.index].fullpath}
                  fullpath={state.covers[virtualRow.index].fullpath}
                  album={state.covers[virtualRow.index].foldername}
                >
                  <BsThreeDots
                    onClick={handleContextMenu}
                    id={state.covers[virtualRow.index].fullpath}
                    fullpath={state.covers[virtualRow.index].fullpath}
                    album={state.covers[virtualRow.index].foldername}
                  />
                </div>
                <span
                  id="coverplay"
                  fullpath={state.covers[virtualRow.index].fullpath}
                  onClick={handlePlayReq}
                >
                  <GiPlayButton />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default AlbumsCoverView;
