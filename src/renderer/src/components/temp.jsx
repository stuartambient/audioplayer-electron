import { useState, useRef, useCallback, useEffect, forwardRef } from 'react';
import classNames from 'classnames';
import { useAudioPlayer } from '../AudioPlayerContext';
import { v4 as uuidv4 } from 'uuid';
import { useAllAlbumsCovers } from '../hooks/useDb';
import { AlbumArt } from '../utility/AlbumArt';
import { BsThreeDots } from 'react-icons/bs';
import { GiPauseButton, GiPlayButton } from 'react-icons/gi';
import NoImage from '../assets/noimage.jpg';
import ViewMore from '../assets/view-more-alt.jpg';
import { useVirtualizer } from '@tanstack/react-virtual';
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

  const rowVirtualizer = useVirtualizer({
    count: hasMoreCovers ? state.covers.length + 1 : state.covers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5
  });

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
