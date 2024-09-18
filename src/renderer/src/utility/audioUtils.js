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
  state.audioRef.current.play();
};

const handleTrackSelect = (event, state, dispatch, ...params) => {
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
    active: event.target.id || params[0].active,
    nextTrack: '',
    prevTrack: '',
    isLiked: params[0].like === 1 ? true : false
  });

  dispatch({
    type: 'direction',
    playNext: false,
    playPrev: false
  });

  loadFile(params[0].audiofile, event.target.id, state, dispatch);
};

export default handleTrackSelect;
