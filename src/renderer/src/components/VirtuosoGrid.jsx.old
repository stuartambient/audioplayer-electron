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
import { VirtuosoGrid } from 'react-virtuoso';
import { Virtuoso } from 'react-virtuoso';
import { openChildWindow } from './ChildWindows/openChildWindow';
import '../style/AlbumsCoverView.css';

const AlbumsCoverView = ({ resetKey, coverSize }) => {
  const { state, dispatch } = useAudioPlayer();
  /*  const [coverUpdate, setCoverUpdate] = useState({ path: '', file: '' }); */
  const [viewMore, setViewMore] = useState(false);
  /* const [coverSearch, setCoverSearch] = useState(); */
  const [coverPath, setCoverPath] = useState('');

  const [renderedItems, setRenderedItems] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const coversObserver = useRef();

  const { coversLoading, hasMoreCovers, coversError } = useAllAlbumsCovers(
    state.coversPageNumber,
    state.coversSearchTerm,
    state.coversDateSort,
    state.coversMissingReq,
    dispatch,
    resetKey,
    state.covers.length
  );

  useEffect(() => {
    // Assuming each grid item has a specific class, e.g., 'grid-item'
    const items = document.querySelectorAll('.virtuoso-grid-item');
    /* setRenderedItemsCount(items.length); */
    console.log(items.length);
    setRenderedItems(items.length);
  });

  useEffect(() => {
    if (renderedItems) {
      dispatch({
        type: 'set-covers-pagenumber',
        coversPageNumber: state.coversPageNumber + 1
      });
    }
  }, [renderedItems]);

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

  const lastCoverElement = useCallback(
    (node) => {
      if (coversLoading) return;
      if (coversObserver.current) coversObserver.current.disconnect();
      coversObserver.current = new IntersectionObserver(
        (entries) => {
          console.log(entries[0].isIntersecting, hasMoreCovers);
          if (entries[0].isIntersecting && hasMoreCovers) {
            dispatch({
              type: 'set-covers-pagenumber',
              coversPageNumber: state.coversPageNumber + 1
            });
          }
        },
        {
          root: document.querySelector(`.albums-coverview--albums`),
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

  const Container = forwardRef(({ children, ...props }, ref) => (
    <ul className={albumsGridName}>{children}</ul>
  ));

  /*   const Item = forwardRef(({ children, index, ...props }, ref) => (
    <div
      className="virtuoso-grid-item"
      ref={state.covers.length === index + 1 ? lastCoverElement : ref}
      {...props}
    >
      {children}
    </div>
  )); */

  const loadMoreCovers = () => {
    console.log('loadMoreCovers called');
    if (coversLoading || !hasMoreCovers) return;
    dispatch({
      type: 'set-covers-pagenumber',
      coversPageNumber: state.coversPageNumber + 1
    });
  };

  /*   useEffect(() => {
    if (visibleRange > 0) {
      loadMoreCovers();
    }
  }, [visibleRange]); */

  return (
    <section className="albums-coverview">
      {state.covers.length > 0 && (
        <VirtuosoGrid
          style={{ height: '100%', width: '100%' }}
          key={uuidv4()}
          initialItemCount={100}
          /* totalCount={200} */
          /* data={state.covers} */
          overscan={50}
          components={{ List: Container }}
          isScrolling={(e) => {
            console.log('Scrolling:', e);
            setIsScrolling(e);
          }}
          atBottomStateChange={(val) => console.log(val)}
          endReached={() => {
            console.log('End reached, loading more items...');
            loadMoreCovers(); // Trigger load more function
          }}
          /* rangeChanged={setVisibleRange} */
          itemClassName="virtuoso-grid-item"
          itemContent={(index) => (
            <li key={uuidv4()} ref={state.covers.length === index + 1 ? lastCoverElement : null}>
              {state.covers[index].img ? (
                <img className={coverImageSize} src={`cover://${state.covers[index].img}`} alt="" />
              ) : (
                <img className={coverImageSize} src={NoImage} alt="" />
              )}
              <div className="overlay">
                <span id={state.covers[index].fullpath}>{state.covers[index].foldername}</span>
                <div
                  className="item-menu"
                  id={state.covers[index].fullpath}
                  fullpath={state.covers[index].fullpath}
                  album={state.covers[index].foldername}
                >
                  <BsThreeDots
                    onClick={handleContextMenu}
                    id={state.covers[index].fullpath}
                    fullpath={state.covers[index].fullpath}
                    album={state.covers[index].foldername}
                  />
                </div>
                <span
                  id="coverplay"
                  fullpath={state.covers[index].fullpath}
                  onClick={handlePlayReq}
                >
                  <GiPlayButton />
                </span>
              </div>
            </li>
          )}
        />
      )}
    </section>
  );
};

export default AlbumsCoverView;
