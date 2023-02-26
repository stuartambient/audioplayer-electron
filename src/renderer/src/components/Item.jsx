import { forwardRef, useState } from 'react';
import { Plus, Minus } from '../assets/icons';

const Item = forwardRef(
  (
    {
      type,
      divId,
      id,
      className,
      href,
      val,
      handleTrackSelection,
      artist,
      title,
      audiofile,
      like,
      showContextMenu,

      /* ALBUMS */
      album,
      albumsTracks,
      foldername,
      albumTracksLength,
      showMore,
      albumPattern,
      handleAlbumTracksRequest,
      term,
      fullpath,
      handleListCheckboxes,
      checked,
      state,
      dispatch
    },
    ref
  ) => {
    /* console.log('checked: ', checked); */
    if (type === 'file') {
      return (
        <div
          id={divId}
          className={className}
          ref={ref}
          fromlisttype={type}
          onContextMenu={showContextMenu}
        >
          <a
            href={href}
            id={id}
            val={val}
            fromlisttype={type}
            onClick={(e) =>
              handleTrackSelection(e, state, dispatch, artist, title, album, audiofile, like)
            }
          >
            Artist: {artist}
            <br></br>
            Title: {title}
            <br></br>
            Album: {album}
          </a>
        </div>
      );
    }

    if (type === 'folder') {
      return (
        <div
          id={id}
          className={className}
          ref={ref}
          fromlisttype={type}
          onContextMenu={showContextMenu}
        >
          <a href={href} id={id} val={val} onClick={(e) => e.preventDefault()}>
            {foldername}
          </a>
          <div>
            <input
              type="checkbox"
              id={id}
              checked={checked}
              data-type="album"
              value={fullpath}
              onChange={handleListCheckboxes}
            />
          </div>
          <div id={id} term={term} onClick={(e) => handleAlbumTracksRequest(e)}>
            {showMore === id ? <Minus id="minus" /> : <Plus id="plus" />}
          </div>
          {albumPattern === fullpath && albumTracksLength ? (
            <ul className="albumtracks">{albumsTracks}</ul>
          ) : null}
        </div>
      );
    }
    if (type === 'playlist') {
      return (
        <div
          id={divId}
          className={className}
          ref={ref}
          fromlisttype={type}
          onContextMenu={showContextMenu}
        >
          <a
            href={href}
            id={id}
            val={val}
            onContextMenu={showContextMenu}
            onClick={(e) =>
              handleTrackSelection(e, state, dispatch, artist, title, album, audiofile, like)
            }
          >
            Artist: {artist}
            <br></br>
            Title: {title}
            <br></br>
            Album: {album}
          </a>
        </div>
      );
    }
  }
);

export default Item;
