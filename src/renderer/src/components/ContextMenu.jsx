import { useState, useEffect, useRef } from 'react';
import { useAudioPlayer } from '../AudioPlayerContext';
import { BsThreeDots } from 'react-icons/bs';
import '../style/FlashEffect.css';

const ContextMenu = ({ fromlisttype, id, fullpath, handleFlash, divid }) => {
  const { state, dispatch } = useAudioPlayer();
  const [contextMenuItem, setContextMenuItem] = useState({ id: '', type: '' });
  const divRef = useRef(null);

  useEffect(() => {
    if (!contextMenuItem) return;
    const cleanup = window.api.onContextMenuCommand((command) => {
      switch (command) {
        case 'add-track-to-playlist':
          const track = state.tracks.find((item) => item.afid === contextMenuItem.id);
          if (track && !state.playlistTracks.find((e) => e.afid === contextMenuItem.id)) {
            dispatch({
              type: 'track-to-playlist',
              playlistTracks: [...state.playlistTracks, track]
            });
          } else {
            return;
          }
          handleFlash(contextMenuItem);
          break;
        case 'edit-track-metadata':
          console.log('Editing track metadata', contextMenuItem);
          break;
        default:
          break;
      }
    });

    return () => cleanup();
  }, [contextMenuItem]);

  /*   useEffect(() => {
    if (contextMenuItem) handleFlash({ id: contextMenuItem.id, type: contextMenuItem.type });
  }, [contextMenuItem]); */

  const handleContextMenu = async (e) => {
    e.preventDefault();
    const id = divRef.current.id;
    const type = divRef.current.dataset.type;
    /* setFlash({ type, id }); */
    setContextMenuItem({ id, type });
    window.api.showContextMenu(id, type);
  };

  return (
    <div
      id={id}
      data-type={fromlisttype}
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
