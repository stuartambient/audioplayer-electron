import { useEffect } from 'react';
import { useAudioPlayer } from '../AudioPlayerContext';
import { Buffer } from 'buffer';

const handlePicture = (buffer) => {
  const bufferToString = Buffer.from(buffer).toString('base64');
  return `data:${buffer.format};base64,${bufferToString}`;
};

const mediaSource = new MediaSource();

const TrackSelector = async (trackInfo) => {
  state.audioRef.current.src = '';

  dispatch({
    type: 'newtrack',
    pause: false,
    newtrack: val,
    selectedTrackListType: listType,
    artist: trackInfo.artist,
    title: trackInfo.title,
    album: trackInfo.album,
    active: trackInfo.id,
    nextTrack: '',
    prevTrack: '',
    isLiked: trackInfo.liked === 1 ? true : false
  });

  dispatch({
    type: 'direction',
    playNext: false,
    playPrev: false
  });

  try {
    state.audioRef.current.src = await `streaming://${trackInfo.file}`;
    /* const buf = await state.audioRef.current.src.arrayBuffer(); */
  } catch (e) {
    console.log(e);
  }

  /*   console.log('startstream: ', startStream);

  const filebuffer = await window.api.streamAudio(file);
  const blob = new Blob([filebuffer], { type: 'audio/wav' });
  const url = window.URL.createObjectURL(blob); */

  /*   state.audioRef.current.src = startStream; */

  const picture = await window.api.getCover(trackInfo.id);
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
