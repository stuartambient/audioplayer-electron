import { useState, useEffect } from 'react';
import { BsThreeDots } from 'react-icons/bs';

const ContextMenu = () => {
  const [contextMenuItem, setContextMenuItem] = useState(null);

  useEffect(() => {
    const cleanup = window.api.onContextMenuCommand((command) => {
      if (!contextMenuItem) return;

      switch (command) {
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
          // Your logic for editing metadata
          console.log('Editing track metadata', contextMenuItem);
          break;
        default:
          break;
      }
    });

    return () => cleanup(); // Clean up the listener when the component unmounts
  }, [contextMenuItem]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    //const term = e.target.getAttribute('fullpath');
    const type = e.target.getAttribute('fromlisttype');
    if (type === null) return;
    const id = e.target.id.split('--')[0];
    setContextMenuItem({ id, type });
    window.api.showContextMenu(id, type);
  };
};
