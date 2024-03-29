import { useState, useEffect, useRef } from 'react';
import { useAudioPlayer } from '../AudioPlayerContext';
import { BsThreeDots } from 'react-icons/bs';
import '../style/FlashEffect.css';

const ContextMenu = ({ fromlisttype, id, fullpath, divid }) => {
  const { state, dispatch } = useAudioPlayer();
  const [contextMenuItem, setContextMenuItem] = useState(null);
  const divRef = useRef(null);

  useEffect(() => {
    if (!contextMenuItem) return;

    const cleanup = window.api.onContextMenuCommand((command) => {
      console.log('command: ', command, contextMenuItem);

      switch (command) {
        case 'add-track-to-playlist':
          const track = state.tracks.find((item) => item.afid === contextMenuItem.id);
          if (track) {
            /* if (!state.playlistTracks.find((e) => e.afid === contextMenuItem.id)) { */
            dispatch({
              type: 'track-to-playlist',
              playlistTracks: [...state.playlistTracks, track]
            });
            if (!state.playlistTracks.find((e) => e.afid === contextMenuItem.id)) {
              dispatch({
                type: 'flash-div',
                flashDiv: contextMenuItem
              });
            }
            //}
          } else {
            return;
          }
          break;
        case 'edit-track-metadata':
          console.log('---> Editing track metadata');
          break;
        case 'add-album-to-playlist':
          const getAlbumTracks = async () => {
            const albumTracks = await window.api.getAlbumTracks(contextMenuItem.path);

            dispatch({
              type: 'play-album',
              playlistTracks: albumTracks
            });
            const diff = albumTracks.filter(
              (p) => !state.playlistTracks.find((d) => d.afid === p.afid)
            );
            if (diff.length > 0) {
              dispatch({
                type: 'flash-div',
                flashDiv: contextMenuItem
              });
            }
          };
          getAlbumTracks();

          /*     if (option[0] === 'remove from playlist') {
      const removeTrack = state.playlistTracks.filter((track) => track.afid !== id);
      dispatch({
        type: 'playlist-clear',
        playlistTracks: removeTrack
      });
    }
  }; */

          break;
        default:
          break;
      }
    });

    return setContextMenuItem(null);
  }, [contextMenuItem]);

  /*   useEffect(() => {
    if (contextMenuItem) handleFlash({ id: contextMenuItem.id, type: contextMenuItem.type });
  }, [contextMenuItem]); */

  const handleContextMenu = async (e) => {
    e.preventDefault();
    const id = divRef.current.id;
    const type = divRef.current.dataset.type;
    const path = divRef.current.dataset.path;
    /* console.log(id, type, path); */
    setContextMenuItem(null);
    if (path) {
      setContextMenuItem({ id, type, path });
    } else {
      setContextMenuItem({ id, type });
    }
    window.api.showContextMenu(id, type);
  };

  return (
    <div
      id={id}
      data-type={fromlisttype}
      data-path={fullpath}
      onClick={handleContextMenu}
      style={{ display: 'flex', alignItems: 'center' }}
      ref={divRef}
      /* className={`${flash ? 'item flash-effect' : 'item'}`} */
    >
      <BsThreeDots />;
    </div>
  );
};

export default ContextMenu;
