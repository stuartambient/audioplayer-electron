import { forwardRef, useState } from 'react';
import ContextMenu from './ContextMenu';

import { forwardRef, useState, useEffect } from 'react';
import { useAudioPlayer } from '../AudioPlayerContext';
import { Buffer } from 'buffer';

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
      /* handleTrackSelection, */
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
      handleNewMenu,
      term,
      fullpath
    },
    ref
  ) => {
    const { state, dispatch } = useAudioPlayer();
    const handlePicture = (buffer) => {
      const bufferToString = Buffer.from(buffer).toString('base64');
      return `data:${buffer.format};base64,${bufferToString}`;
    };

    const loadFile = async (file, id) => {
      try {
        state.audioRef.current.src = await `streaming://${file}`;
        /* const buf = await state.audioRef.current.src.arrayBuffer(); */
      } catch (e) {
        console.log(e);
      }
      const picture = await window.api.getCover(id);
      if (picture === 0) {
        dispatch({
          type: 'set-cover',
          cover: 'not available'
        });
      } else {
        dispatch({
          type: 'set-cover',
          cover: handlePicture(picture)
        });
      }
      state.audioRef.current.load();
      state.audioRef.current.play();
    };

    const handleTrackSelect = (event, ...params) => {
      event.preventDefault();
      let listType;
      if (!event.target.getAttribute('fromlisttype')) {
        listType = 'playlist';
      } else {
        listType = event.target.getAttribute('fromlisttype');
      }

      state.audioRef.current.src = '';

      dispatch({
        type: 'newtrack',
        pause: false,
        newtrack: event.target.getAttribute('val'),
        selectedTrackListType: listType,
        artist: params[0].artist,
        title: params[0].title,
        album: params[0].album,
        active: event.target.id,
        nextTrack: '',
        prevTrack: '',
        isLiked: params[0].like === 1 ? true : false
      });

      dispatch({
        type: 'direction',
        playNext: false,
        playPrev: false
      });

      loadFile(params[0].audiofile, event.target.id);
    };

    if (type === 'file') {
      return (
        <div
          id={divId}
          className={flashDiv === divId ? 'item flash' : className}
          ref={ref}
          fromlisttype={type}
        >
          <a
            href={href}
            id={id}
            val={val}
            fromlisttype={type}
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
            <ContextMenu fromlisttype={type} id={id} />
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
            <ContextMenu fromlisttype={type} id={id} fullpath={fullpath} />
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
            onClick={(e) => handleTrackSelect(e, { artist, title, album, audiofile, like })}
            /* onClick={(e) => handleTrackSelect(e, { artist, title, album, audiofile, like })} */
          >
            Artist: {artist}
            <br></br>
            Title: {title}
            <br></br>
            Album: {album}
          </a>
          <div className="item-menu">
            <ContextMenu fromlisttype={type} id={divId} />
          </div>
        </div>
      );
    }
  }
);

export default Item;
