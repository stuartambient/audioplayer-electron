useEffect(() => {
  const audio = state.audioRef.current;

  const handleLoadedMetadata = (e) => {
    console.log('onloadedmetadata: ', e);
    audio.play();
    dispatch({ type: 'duration', duration: convertDuration(audio) });
    dispatch({ type: 'set-delay', delay: true });
  };

  const handleError = (e) => {
    const { code, message } = e.target.error; // Note: Adjusted for potential cross-browser compatibility
    console.log(code, message);
  };

  const handleSeeking = () => {
    dispatch({ type: 'seeking', seeking: true });
    setTimeout(() => dispatch({ type: 'seeking', seeking: false }), 2000);
  };

  const handleVolumeChange = () => {
    dispatch({ type: 'set-volume', volume: audio.volume });
  };

  const handleEnded = () => {
    dispatch({ type: 'direction', playNext: true });
    dispatch({ type: 'set-delay', delay: false });
  };

  audio.onloadedmetadata = handleLoadedMetadata;
  audio.onerror = handleError;
  audio.onseeking = handleSeeking;
  audio.onvolumechange = handleVolumeChange;
  audio.onended = handleEnded;

  return () => {
    audio.onloadedmetadata = null;
    audio.onerror = null;
    audio.onseeking = null;
    audio.onvolumechange = null;
    audio.onended = null;
  };
}, [state.audioRef]); // Assuming the audioRef is stable, otherwise consider dependencies that might change

// Keep these useEffects as they are, because they handle different concerns:
useEffect(() => {
  if (state.pause) state.audioRef.current.pause();
  else state.audioRef.current.play();
}, [state.pause, state.audioRef.current]);

useEffect(() => {
  const changeScreenMode = async () => {
    if (state.minimalmode && state.player) {
      await window.api.screenMode(state.miniModePlaylist ? 'mini-expanded' : 'mini');
    } else if (!state.minimalmode && state.player) {
      await window.api.screenMode('default');
    }
  };
  changeScreenMode();
}, [state.minimalmode, state.player, state.miniModePlaylist]);
