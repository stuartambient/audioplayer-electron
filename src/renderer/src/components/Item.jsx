import { forwardRef, useState, useEffect, memo } from 'react';
import ContextMenu from './ContextMenu';
import { useAudioPlayer } from '../AudioPlayerContext';
import { Buffer } from 'buffer';
import { Plus, Minus } from '../assets/icons';
import { BsThreeDots } from 'react-icons/bs';
import '../style/FlashEffect.css';

const Item = forwardRef((props, ref) => {
  const { state, dispatch } = useAudioPlayer();
  const handlePicture = (buffer) => {
    const bufferToString = Buffer.from(buffer).toString('base64');
    return `data:${buffer.format};base64,${bufferToString}`;
  };

  const loadFile = async (file, id) => {
    try {
      console.log('file: ', file);
      state.audioRef.current.src = await `streaming://${file}`;
      /* const buf = await state.audioRef.current.src.arrayBuffer(); */
    } catch (e) {
      console.log(e);
    }
    const picture = await window.api.getCover(file);
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

  if (props.type === 'file') {
    const newId = props.divId.split('--')[0];
    return (
      <div
        className={state.flashDiv?.id === newId ? 'item flash-effect' : props.className}
        id={props.divId}
        ref={ref}
        fromlisttype={props.type}
      >
        <a
          href={props.href}
          id={props.id}
          val={props.val}
          fromlisttype={props.type}
          onClick={(e) =>
            handleTrackSelect(e, {
              artist: props.artist,
              title: props.title,
              album: props.album,
              audiofile: props.audiofile,
              like: props.like
            })
          }
        >
          Artist: {props.artist}
          <br></br>
          Title: {props.title}
          <br></br>
          Album: {props.album}
          <br></br>
          {/* Genre: {props.genre}
          Lossless: {props.lossless}
          Bitrate: {parseFloat(Math.round(props.bitrate).toPrecision(4))}
          samplerate: {props.samplerate} */}
        </a>
        <div className="item-menu">
          <ContextMenu fromlisttype={props.type} id={props.id} divid={props.divId} />
        </div>
      </div>
    );
  }

  if (props.type === 'folder') {
    return (
      <div
        id={props.id}
        className={state.flashDiv?.id === props.id ? 'item flash-effect' : props.className}
        ref={ref}
        fromlisttype={props.type}
      >
        <a href={props.href} id={props.id} val={props.val} onClick={(e) => e.preventDefault()}>
          {props.foldername}
        </a>
        <div className="item-menu" fullpath={props.fullpath}>
          <ContextMenu fromlisttype={props.type} id={props.id} fullpath={props.fullpath} />
        </div>
        <div id={props.id} term={props.term} onClick={(e) => props.handleAlbumTracksRequest(e)}>
          {props.showMore === props.id ? <Minus id="minus" /> : <Plus id="plus" />}
        </div>
        {props.albumPattern === props.fullpath && props.albumTracksLength ? (
          <ul className="albumtracks">{props.albumsTracks}</ul>
        ) : null}
      </div>
    );
  }
  if (props.type === 'playlist') {
    return (
      <div
        id={props.divId}
        className={props.className}
        ref={ref}
        fromlisttype={props.type}
        /* setFlash={setFlash}
        divId={divId} */
      >
        <a
          href={props.href}
          id={props.id}
          val={props.val}
          onClick={(e) =>
            handleTrackSelect(e, {
              artist: props.artist,
              title: props.title,
              album: props.album,
              audiofile: props.audiofile,
              like: props.like
            })
          }
          /* onClick={(e) => handleTrackSelect(e, { artist, title, album, audiofile, like })} */
        >
          Artist: {props.artist}
          <br></br>
          Title: {props.title}
          <br></br>
          Album: {props.album}
        </a>
        <div className="item-menu">
          <ContextMenu
            fromlisttype={props.type}
            id={props.id}
            /* handleFlash={setFlash} */ divid={props.divId}
          />
        </div>
      </div>
    );
  }
});

export default Item;
