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
      checked
      //state,
      //dispatch
    },
    ref
  ) => {
    const { state, dispatch } = useAudioPlayer();

    const handlePicture = (buffer) => {
      const bufferToString = Buffer.from(buffer).toString('base64');
      return `data:${buffer.format};base64,${bufferToString}`;
    };

    /*     const useServer = (state, file) => {
      useEffect(() => {
        const startStream = async () => {
          try {
            state.audioRef.current.src = `streaming://${file}`;
          } catch (e) {
            console.log('error: ', e);
          }
        };

        if (state && file) {
          startStream();
        }

        return () => {};
      }, [state, file]);
    }; */

    const loadFile = async (state, file) => {
      console.log('file: ', file, 'state: ', state);
      try {
        state.audioRef.current.src = await `streaming://${file}`;
        /* const buf = await state.audioRef.current.src.arrayBuffer(); */
      } catch (e) {
        console.log(e);
      }
      const picture = await window.api.getCover(event.target.id);
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
    };

    const handleTrackSelect = (event, params) => {
      event.preventDefault();
      console.log('event: ', event.target, 'params: ', params);
      //const trackInfo = {
      //track: event.target,
      //id: event.target.id,
      //val: event.target.getAttribute('val'),
      //listType: event.target.getAttribute('fromlisttype'),
      //artist: params.artist,
      //title: params.title,
      //album: params.album,
      //file: params.audiofile
      //liked: params.like
      //};
      state.audioRef.current.src = '';

      dispatch({
        type: 'newtrack',
        pause: false,
        newtrack: event.target.getAttribute('val'),
        selectedTrackListType: event.target.getAttribute('fromlisttype'),
        artist: params.artist,
        title: params.title,
        album: params.album,
        active: event.target.id,
        nextTrack: '',
        prevTrack: '',
        isLiked: params.like === 1 ? true : false
      });

      dispatch({
        type: 'direction',
        playNext: false,
        playPrev: false
      });

      loadFile(state, params.audiofile);
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
