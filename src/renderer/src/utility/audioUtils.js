import { Buffer } from 'buffer';

const handlePicture = (buffer) => {
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
  //console.log('picture: ', picture);
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
  //console.log('event.target: ', event.target, event.target.getAttribute('fromlisttype'));
  //const listType = event.target.getAttribute('fromlistType');
  event.preventDefault();

  if (event.target.id) {
    console.log('event.target.id: ', event.target, '----', state.active);
    if (event.target.id === state.active) {
      return;
    }
  }

  /*   if (params[0].active) {
    console.log('params: ', event.params[0].active, '----', state.active);
    if (params[0].active) {
      return;
    }
  } */

  state.audioRef.current.src = '';

  dispatch({
    type: 'newtrack',
    pause: state.pause,
    newtrack: event.target.getAttribute('val') || params[0].newtrack,
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

  /*  dispatch({
    type: 'usertriggered'
  }); */

  loadFile(params[0].audiofile, event.target.id, state, dispatch);
};

export default handleTrackSelect;
