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

  useEffect(() => {
    console.log('parentRef: ', parentRef.current);
  }, [parentRef.current]);

  useEffect(() => {
    console.log('hasMoreCovers: ', hasMoreCovers);
    console.log('state covers: ', state.covers.length);
  }, [hasMoreCovers]);

  // Initialize the virtualizer with a fallback when data is not ready
  const rowVirtualizer = useVirtualizer({
    //count: hasMoreCovers ? state.covers.length + 1 : state.covers.length,
    count: 100,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5,
    debug: true
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    console.log('lastItem: ', lastItem);
    console.log('items:', rowVirtualizer.getVirtualItems());
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
      style={{ height: '100%', width: '100%', overflowY: 'auto' }}
    >
      <ul className={albumsGridName} ref={parentRef}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * 1;
          const endIndex = startIndex + 99;
          const rowItems = endIndex - startIndex;

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
