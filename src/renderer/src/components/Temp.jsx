const handleManualChange = (track) => {
  const listType = state.activeList === 'tracklistActive' ? state.track : state.playlistTracks;
  const newTrack = state.tracks.findIndex((obj) => obj.track_id === track);
  console.log('newTrack: ', state.tracks[newTrack]);
  const evt = {
    preventDefault: () => {
      console.log('preventDefault called');
    },
    target: {
      id: track,
      getAttribute: (attr) => {
        const attributes = {
          val: newTrack // Add your custom attributes here
        };
        return attributes[attr] || null; // Return the attribute value if it exists
      }
    }
  };
  return handleTrackSelect(evt, state, dispatch, {
    newtrack: newTrack,
    artist: state.tracks[newTrack].performers,
    title: state.tracks[newTrack].title,
    album: state.tracks[newTrack].album,
    audiofile: state.tracks[newTrack].audiotrack,
    like: state.tracks[newTrack].like,
    active: state.tracks[newTrack].track_id,
    list: state.activeList
  });
};

useEffect(() => {
  const handleTrackChange = (trackId) => {
    const changeTrack = new Event('click', {
      bubbles: true,
      cancelable: false
    });

    const toTrack = document.getElementById(trackId);
    if (toTrack) {
      toTrack.dispatchEvent(changeTrack);
    } else {
      console.error(`Element with ID ${trackId} not found in the DOM.`);
    }
  };

  const listRef = state.activeList === 'tracklistActive' ? fileslistRef : playlistRef;

  const nextIndex =
    state.activeList === 'tracklistActive'
      ? state.tracks.findIndex((obj) => obj.track_id === state.nextTrack)
      : state.playlistTracks.findIndex((obj) => obj.track_id === state.nextTrack);

  const prevIndex =
    state.activeList === 'tracklistActive'
      ? state.tracks.findIndex((obj) => obj.track_id === state.prevTrack)
      : state.playlistTracks.findIndex((obj) => obj.track_id === state.prevTrack);

  if (state.playNext && state.nextTrack && state.newtrack < state.tracks.length - 1) {
    /*     const listRef = state.activeList === 'tracklistActive' ? fileslistRef : playlistRef; */

    if (!state.listScroll) {
      return handleManualChange(state.nextTrack);
    }

    if (state.listScroll) {
      listRef.current.scrollToIndex({
        index: state.newtrack + 1,
        align: 'start'
      });
      if (nextIndex >= visibleRange.startIndex && nextIndex <= visibleRange.endIndex) {
        handleTrackChange(state.nextTrack);
      }
    }
  }

  if (state.playPrev && state.prevTrack && state.newtrack > 0) {
    if (!state.listScroll) {
      return handleManualChange(state.prevTrack);
    }

    if (state.listScroll) {
      listRef.current.scrollToIndex({
        index: state.newtrack - 1,
        align: 'start'
      });
      if (prevIndex >= visibleRange.startIndex && prevIndex <= visibleRange.endIndex) {
        handleTrackChange(state.prevTrack);
      }
    }
  }
}, [
  state.playNext,
  state.nextTrack,
  state.playPrev,
  state.prevTrack,
  state.tracks,
  state.playlistTracks,
  fileslistRef,
  playlistRef,
  state.newtrack,
  visibleRange
]);
