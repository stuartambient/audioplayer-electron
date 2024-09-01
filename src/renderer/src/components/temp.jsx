import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAudioPlayer } from './YourAudioPlayerContext'; // Adjust import path as needed
import { useAllAlbumsCovers } from './YourHooks'; // Adjust import path as needed
import { BsThreeDots } from 'react-icons/bs';
import { GiPlayButton } from 'react-icons/gi';
import NoImage from './path-to-no-image'; // Adjust import path as needed
import classNames from 'classnames';

const AlbumsCoverView = ({ resetKey, coverSize }) => {
  const { state, dispatch } = useAudioPlayer();
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

  const getEstimatedSize = useCallback(() => {
    return coverSize === 1 ? 100 : coverSize === 2 ? 150 : 200;
  }, [coverSize]);

  const gap = 10; // Gap between items (both rows and columns)

  const calculateLayout = useCallback(() => {
    const estimatedSize = getEstimatedSize();
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
    overscan: 5
  });

  // Force recalculation when covers change
  useEffect(() => {
    rowVirtualizer.measure();
  }, [state.covers, rowVirtualizer]);

  const loadMoreCovers = useCallback(() => {
    if (hasMoreCovers && !coversLoading) {
      console.log('Loading more covers...');
      dispatch({
        type: 'set-covers-pagenumber',
        coversPageNumber: state.coversPageNumber + 1
      });
    } else {
      console.log('Cannot load more covers:', { hasMoreCovers, coversLoading });
    }
  }, [hasMoreCovers, coversLoading, dispatch, state.coversPageNumber]);

  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    const lastItem = virtualItems[virtualItems.length - 1];

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
  }, [rowVirtualizer.getVirtualItems(), hasMoreCovers, coversLoading, rows, loadMoreCovers]);

  const coverImageSize = classNames('cover-image', {
    'image-small': coverSize === 1,
    'image-medium': coverSize === 2,
    'image-large': coverSize === 3
  });

  const handleContextMenu = (event) => {
    // Implement your context menu logic here
  };

  const handlePlayReq = (event) => {
    // Implement your play request logic here
  };

  return (
    <div
      ref={parentRef}
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
            ref={rowVirtualizer.measureElement}
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
                if (!item) return null;

                return (
                  <div
                    key={itemIndex}
                    style={{
                      width: `${estimatedSize}px`,
                      height: `${estimatedSize}px`,
                      position: 'relative'
                    }}
                  >
                    {item.img ? (
                      <img
                        className={coverImageSize}
                        src={`cover://${item.img}`}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <img
                        className={coverImageSize}
                        src={NoImage}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
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
      {coversLoading && <div>Loading more...</div>}
      {coversError && <div>Error loading covers: {coversError}</div>}
    </div>
  );
};

export default AlbumsCoverView;
