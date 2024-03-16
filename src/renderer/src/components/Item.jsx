import { forwardRef, useState } from 'react';
import { Plus, Minus } from '../assets/icons';
import { BsThreeDots } from 'react-icons/bs';

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
      genre,
      audiofile,
      like,
      showContextMenu,
      flashDiv,
      lossless,
      bitrate,
      samplerate,

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
      checked,
      state,
      dispatch
    },
    ref
  ) => {
    const handleTrackSelect = (event, params) => {
      event.preventDefault();
      const trackInfo = {
        track: event.target,
        id: event.target.id,
        val: event.target.getAttribute('val'),
        listType: event.target.getAttribute('fromlisttype'),
        artist: params.artist,
        title: params.title,
        album: params.album,
        file: params.audiofile,
        liked: params.like
      };
      handleTrackSelection(trackInfo);
    };

    if (type === 'file') {
      /* console.log('ref: ', ref); */
      return (
        <div
          id={divId}
          className={flashDiv === divId ? 'item flash' : className}
          ref={ref}
          fromlisttype={type}
          /* onContextMenu={showContextMenu} */
        >
          <a
            href={href}
            id={id}
            val={val}
            fromlisttype={type}
            /* onClick={(e) => handleTrackSelection(e, { artist, title, album, audiofile, like })} */
            onClick={(e) => handleTrackSelect(e, { artist, title, album, audiofile, like })}
          >
            Artist: {artist}
            <br></br>
            Title: {title}
            <br></br>
            Album: {album}
            <br></br>
            Genre: {genre}
            Lossless: {lossless}
            Bitrate: {bitrate / 1000}
            samplerate: {samplerate}
          </a>
          <div className="item-menu">
            <BsThreeDots
              /* onContextMenu={showContextMenu}  */ onClick={showContextMenu}
              fromlisttype={type}
              id={divId}
            />
          </div>
        </div>
      );
    }

    if (type === 'folder') {
      return (
        <div id={id} className={className} ref={ref} fromlisttype={type}>
          <a href={href} id={id} val={val} onClick={(e) => e.preventDefault()}>
            {foldername}
          </a>
          <div className="item-menu" fullpath={fullpath}>
            <BsThreeDots
              /*  onContextMenu={showContextMenu} */
              onClick={showContextMenu}
              fromlisttype={type}
              id={id}
              fullpath={fullpath}
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
        <div id={divId} className={className} ref={ref} fromlisttype={type}>
          <a
            href={href}
            id={id}
            val={val}
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
          <div className="item-menu">
            <BsThreeDots
              /* onContextMenu={showContextMenu} */ onClick={showContextMenu}
              fromlisttype={type}
              id={divId}
            />
          </div>
        </div>
      );
    }
  }
);

export default Item;
