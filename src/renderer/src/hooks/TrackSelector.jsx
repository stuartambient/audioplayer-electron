import { useEffect } from 'react';
import { Buffer } from 'buffer';

const handlePicture = (buffer) => {
  const bufferToString = Buffer.from(buffer).toString('base64');
  return `data:${buffer.format};base64,${bufferToString}`;
};

const TrackSelector = async (
  e,
  state,
  dispatch,
  artist = null,
  title = null,
  album = null,
  audiofile = null,
  like = null
) => {
  let track, id, val, listType, file, liked;
  if (e.target) {
    e.preventDefault();
    track = e.target;
    id = e.target.id;
    val = +e.target.getAttribute('val');
    listType = e.target.getAttribute('fromlisttype');
    file = audiofile;
    liked = like;
  } else {
    track = e;
    id = track.afid;
    val = 0;
    listType = 'playlist';
    file = track.audiofile;
    liked = track.like;
  }

  state.audioRef.current.src = '';

  dispatch({
    type: 'newtrack',
    pause: false,
    newtrack: val,
    selectedTrackListType: listType,
    artist: artist || track.artist,
    title: title || track.title,
    album: album || track.album,
    active: id,
    nextTrack: '',
    prevTrack: '',
    isLiked: liked === 1 ? true : false
  });

  dispatch({
    type: 'direction',
    playNext: false,
    playPrev: false
  });

  try {
    state.audioRef.current.src = await `streaming://${file}`;
  } catch (e) {
    console.log(e);
  }

  /*   console.log('startstream: ', startStream);

  const filebuffer = await window.api.streamAudio(file);
  const blob = new Blob([filebuffer], { type: 'audio/wav' });
  const url = window.URL.createObjectURL(blob); */

  /*   state.audioRef.current.src = startStream; */

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
};

export default TrackSelector;
