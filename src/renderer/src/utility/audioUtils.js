import { Buffer } from 'buffer';

export const handlePicture = (buffer) => {
  if (!buffer) return;
  const bufferToString = Buffer.from(buffer).toString('base64');
  return `data:${buffer.format};base64,${bufferToString}`;
};

const loadFile = async (file, id, state, dispatch) => {
  try {
    state.audioRef.current.src = await `streaming://${file}`;
    /* const buf = await state.audioRef.current.src.arrayBuffer(); */
  } catch (e) {
    console.log(e);
  }
  const picture = await window.api.getCover(file);

  if (picture === 0 || !picture) {
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
  if (!state.pause) {
    state.audioRef.current.play();
  }
};

const handleTrackSelect = (event, state, dispatch, ...params) => {
  event.preventDefault();

  console.log('handle track select params: ', params);

  if (event.target.id) {
    if (event.target.id === state.active) {
      return;
    }
  }

  //state.audioRef.current.src = '';

  dispatch({
    type: 'newtrack',
    pause: state.pause,
    newtrack: event.target.getAttribute('val'),
    artist: params[0].artist,
    title: params[0].title,
    album: params[0].album,
    active: event.target.id || params[0].active,
    nextTrack: '',
    prevTrack: '',
    isLiked: params[0].like === 1 ? true : false,
    activeList: params[0].list
  });

  dispatch({
    type: 'direction',
    playNext: false,
    playPrev: false
  });
  try {
    loadFile(params[0].audiofile, event.target.id, state, dispatch);
  } catch (error) {
    console.error('error: ', error);
  }
};

export const handleManualChange = (track, state, dispatch) => {
  const listType = state.activeList === 'tracklistActive' ? state.tracks : state.playlistTracks;
  const newTrack = listType.findIndex((obj) => obj.track_id === track);
  console.log(listType[newTrack]);
  const evt = {
    preventDefault: () => {
      console.log('preventDefault called');
    },
    target: {
      id: track,
      getAttribute: (attr) => {
        const attributes = {
          val: newTrack
        };
        return attributes[attr] || null;
      }
    }
  };
  return handleTrackSelect(evt, state, dispatch, {
    //newtrack: newTrack,
    artist: listType[newTrack].performers ? listType[newTrack].performers : 'not available',
    title: listType[newTrack].title ? listType[newTrack].title : listType[newTrack].audiotrack,
    album: listType[newTrack].album ? listType[newTrack].album : 'not available',
    audiofile: listType[newTrack].audiotrack,
    like: listType[newTrack].like,
    active: listType[newTrack].track_id,
    list: state.activeList
  });
};

export default handleTrackSelect;
