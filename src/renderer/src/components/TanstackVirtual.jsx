/* SELECT foldername FROM albums ORDER BY datecreated DESC LIMIT 10 */
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
import '../style/AlbumsCoverView.css';

const AlbumsCoverView = ({ resetKey, coverSize }) => {
  const { state, dispatch } = useAudioPlayer();
  const [viewMore, setViewMore] = useState(false);
  const [coverPath, setCoverPath] = useState('');

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

  const loadMoreCovers = () => {
    dispatch({
      type: 'set-covers-pagenumber',
      coversPageNumber: state.coversPageNumber + 1
    });
  };

  // Initialize the virtualizer with a fallback when data is not ready
  const rowVirtualizer = useVirtualizer({
    count: hasMoreCovers ? state.covers.length + 1 : state.covers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5
  });
  /*   useEffect(() => {
    if (rowVirtualizer.virtualItems && rowVirtualizer.virtualItems.length > 0) {
      const lastItem = rowVirtualizer.virtualItems[rowVirtualizer.virtualItems.length - 1];
      if (lastItem.index >= Math.ceil(state.covers.length / 4) - 1) {
        console.log('End reached, loading more items...');
        loadMoreCovers();
      }
    }
  }, [rowVirtualizer.virtualItems, state.covers.length, loadMoreCovers]); */

  /*   useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    console.log('lastItem: ', lastItem);

    if (!lastItem) {
      return;
    }

    if (lastItem.index >= state.covers.length - 1 && hasMoreCovers && !coversLoading) {
      loadMoreCovers();
    }
  }, [
    hasMoreCovers,
    loadMoreCovers,
    state.covers.length,
    coversLoading,
    rowVirtualizer.getVirtualItems()
  ]); */

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (!lastItem) {
      return;
    }

    if (lastItem.index >= state.covers.length - 1 && hasMoreCovers && !coversLoading) {
      loadMoreCovers();
    }
  }, [
    hasMoreCovers,
    loadMoreCovers,
    state.covers.length,
    coversLoading,
    rowVirtualizer.getVirtualItems()
  ]);

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
      className="albums-coverview"
      ref={parentRef}
      style={{ height: '100%', width: '100%', overflowY: 'auto' }}
    >
      <ul className={albumsGridName}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * 1;
          const endIndex = startIndex + 1;
          const rowItems = state.covers.slice(startIndex, endIndex);

          return (
            <>
              {rowItems.length > 0 &&
                rowItems.map((cover, index) => (
                  <li key={uuidv4()}>
                    {cover.img ? (
                      <img className={coverImageSize} src={`cover://${cover.img}`} alt="" />
                    ) : (
                      <img className={coverImageSize} src={NoImage} alt="" />
                    )}
                    <div className="overlay">
                      <span id={cover.fullpath}>{cover.foldername}</span>
                      <div
                        className="item-menu"
                        id={cover.fullpath}
                        fullpath={cover.fullpath}
                        album={cover.foldername}
                      >
                        <BsThreeDots
                          onClick={handleContextMenu}
                          id={cover.fullpath}
                          fullpath={cover.fullpath}
                          album={cover.foldername}
                        />
                      </div>
                      <span id="coverplay" fullpath={cover.fullpath} onClick={handlePlayReq}>
                        <GiPlayButton />
                      </span>
                    </div>
                  </li>
                ))}
            </>
          );
        })}
      </ul>
    </section>
  );
};

export default AlbumsCoverView;
