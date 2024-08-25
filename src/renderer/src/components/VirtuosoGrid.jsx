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
import { openChildWindow } from './ChildWindows/openChildWindow';
import '../style/AlbumsCoverView.css';

const AlbumsCoverView = ({ resetKey, coverSize }) => {
  const { state, dispatch } = useAudioPlayer();
  const [viewMore, setViewMore] = useState(false);
  const coversObserver = useRef();

  const { coversLoading, hasMoreCovers } = useAllAlbumsCovers(
    state.coversPageNumber,
    state.coversSearchTerm,
    state.coversDateSort,
    state.coversMissingReq,
    dispatch,
    resetKey,
    state.covers.length
  );

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

  return (
    <section className="albums-coverview">
      <VirtuosoGrid
        //className={albumsGridName}
        style={{ height: '100vh', width: '100%' }} // Full height and responsive width
        totalCount={state.covers.length}
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
              <span id="coverplay" fullpath={state.covers[index].fullpath} onClick={handlePlayReq}>
                <GiPlayButton />
              </span>
            </div>
          </li>
        )}
        components={{
          List: forwardRef(({ style, children }, ref) => (
            <ul
              ref={ref}
              style={style}
              className={albumsGridName} // Apply the dynamic grid class
            >
              {children}
            </ul>
          ))
          //Item: 'div' // Wrapper for each item
        }}
      />
    </section>
  );
};

export default AlbumsCoverView;
