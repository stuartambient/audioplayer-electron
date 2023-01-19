import InfiniteList from './Components/InfiniteList';
import useAppState from './hooks/useAppState';

const ChildApp = () => {
  return (
    <InfiniteList
      handleTrackSelection={handleTrackSelection}
      library={state.library}
      currentTrack={state.newtrack}
      playNext={state.playNext}
      playPrev={state.playPrev}
      nextTrack={state.nextTrack}
      prevTrack={state.prevTrack}
      active={state.active}
      dispatch={dispatch}
      /* handlePicture={handlePicture} */
      tracks={state.tracks}
      tracksPageNumber={state.tracksPageNumber}
    />
  );
};

export default ChildApp;
