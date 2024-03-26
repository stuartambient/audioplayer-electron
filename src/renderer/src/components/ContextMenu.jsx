import { useState, useEffect, useRef } from 'react';
import { BsThreeDots } from 'react-icons/bs';

const ContextMenu = ({ fromlisttype, id, fullpath }) => {
  const [contextMenuItem, setContextMenuItem] = useState(null);
  const divRef = useRef(null);

  /*   useEffect(() => {
    if (contextMenuItem) console.log(contextMenuItem);
    const cleanup = window.api.onContextMenuCommand(command);
  }, [contextMenuItem]); */

  useEffect(() => {
    if (!contextMenuItem) return;
    const cleanup = window.api.onContextMenuCommand((command) => {
      switch (command) {
        case 'add-track-to-playlist':
          console.log('Adding track to playlist', contextMenuItem);
          const track = state.tracks.find((item) => item.afid === contextMenuItem.id);
          if (track) {
            if (!state.playlistTracks.find((e) => e.afid === contextMenuItem.id)) {
              setFlashDiv({ type: contextMenuItem.type, id: `${track.afid}--item-div` });
            } else {
              return;
            }
            dispatch({
              type: 'track-to-playlist',
              playlistTracks: [...playlistTracks, track]
            });
          }
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

  const handleContextMenu = async (e) => {
    e.preventDefault();
    const id = divRef.current.id;
    const type = divRef.current.dataset.type;
    setContextMenuItem({ id, type });
    window.api.showContextMenu(id, type);

    //const term = e.target.getAttribute('fullpath');
    /*     const type = e.target.getAttribute('fromlisttype');
    if (type === null) return;
    const id = e.target.id.split('--')[0];
    setContextMenuItem({ id, type });
    window.api.showContextMenu(id, type); */

    /*     switch (command) {
      case 'add-track-to-playlist':
        // Your logic to add track to playlist
        console.log('Adding track to playlist', contextMenuItem);
        const track = state.tracks.find((item) => item.afid === contextMenuItem.id);
        if (track) {
          if (!state.playlistTracks.find((e) => e.afid === contextMenuItem.id)) {
            setFlashDiv({ type: contextMenuItem.type, id: `${track.afid}--item-div` });
          } else {
            return;
          }
          dispatch({
            type: 'track-to-playlist',
            playlistTracks: [...playlistTracks, track]
          });
        }
        break;
      case 'edit-track-metadata':
        console.log('Editing track metadata', contextMenuItem);
        break;
      default:
        break;
    } */
  };
  return (
    <div
      id={id}
      data-type={fromlisttype}
      onClick={handleContextMenu}
      style={{ display: 'flex', alignItems: 'center' }}
      ref={divRef}
    >
      <BsThreeDots />;
    </div>
  );
};

export default ContextMenu;
