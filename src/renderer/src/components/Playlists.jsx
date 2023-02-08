import { useEffect, useState } from 'react';
import { useGetPlaylists } from '../hooks/useDb';
import '../style/Playlists.css';

const Playlists = () => {
  const { myPlaylists } = useGetPlaylists();
  const [playlistRequest, setPlaylistRequest] = useState('no request');

  const handlePlaylistRequest = async (e) => {
    console.log(e.target.getAttribute('data-file'));
    setPlaylistRequest(e.target.id);
    const filename = e.target.getAttribute('data-file');
    switch (e.target.id) {
      case 'edit':
        const editfile = window.api.homepagePlaylists('edit', filename);
        break;
      case 'delete':
        const deletefile = window.api.homepagePlaylists('delete', filename);
        break;
      case 'play':
        const playfile = window.api.homepagePlaylists('play', filename);
        break;
      default:
        return;
    }
  };

  return (
    <div className="playlists">
      {myPlaylists ? (
        <ul className="playlists-list" style={{ color: 'white', listStyle: 'none' }}>
          <h5>Create new playlist</h5>
          {myPlaylists.map((mpl) => {
            return (
              <li className="name">
                <p>{mpl}</p>

                <span id="edit" data-file={mpl} onClick={handlePlaylistRequest}>
                  Edit
                </span>
                <span id="delete" data-file={mpl} onClick={handlePlaylistRequest}>
                  Delete
                </span>
                <span id="play" data-file={mpl} onClick={handlePlaylistRequest}>
                  Play
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};

export default Playlists;
