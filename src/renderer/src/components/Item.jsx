import { forwardRef, useState, useEffect, memo } from 'react';
import ContextMenu from './ContextMenu';
import { useAudioPlayer } from '../AudioPlayerContext';
import { Buffer } from 'buffer';
import handleTrackSelect from '../utility/audioUtils';
import { Plus, Minus } from '../assets/icons';
import { BsThreeDots } from 'react-icons/bs';
import '../style/FlashEffect.css';

const Item = forwardRef((props, ref) => {
  const { state, dispatch } = useAudioPlayer();

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
            handleTrackSelect(e, state, dispatch, {
              artist: props.artist,
              title: props.title,
              album: props.album,
              audiofile: props.audiofile,
              like: props.like,
              list: 'tracklistActive'
            })
          }
        >
          <span>Artist:</span> {props.artist}
          <br></br>
          <span>Title:</span>
          {props.title}
          <br></br>
          <span>Album:</span> {props.album}
          <br></br>
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
        <div className="item-albumname">
          <a href={props.href} id={props.id} val={props.val} onClick={(e) => e.preventDefault()}>
            {props.foldername}
          </a>
        </div>
        <div className="item-menu" fullpath={props.fullpath}>
          <ContextMenu fromlisttype={props.type} id={props.id} fullpath={props.fullpath} />
        </div>
        <div
          className="item-albumtrack"
          id={props.id}
          term={props.term}
          onClick={(e) => props.handleAlbumTracksRequest(e)}
        >
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
      <div id={props.divId} className={props.className} ref={ref} fromlisttype={props.type}>
        <a
          href={props.href}
          id={props.id}
          val={props.val}
          onClick={(e) =>
            handleTrackSelect(e, state, dispatch, {
              artist: props.artist,
              title: props.title,
              album: props.album,
              audiofile: props.audiofile,
              like: props.like,
              list: 'playlistActive'
            })
          }
        >
          Artist: {props.artist}
          <br></br>
          Title: {props.title}
          <br></br>
          Album: {props.album}
        </a>
        <div className="item-menu">
          <ContextMenu fromlisttype={props.type} id={props.id} divid={props.divId} />
        </div>
      </div>
    );
  }
});

export default Item;
