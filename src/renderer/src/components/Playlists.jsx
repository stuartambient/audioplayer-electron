import { useState } from 'react';
import { useGetPlaylists } from '../hooks/useDb';
import '../style/Playlists.css';

const Playlists = () => {
  console.log('playlists called');
  const [myPlaylists, setMyPlaylists] = useState(['no playlists']);
  useGetPlaylists(setMyPlaylists);
  const [playlistRequest, setPlaylistRequest] = useState('no request');

  const handlePlaylistRequest = async (e) => {
    console.log(e.target.getAttribute('data-file'));
    setPlaylistRequest(e.target.id);
    const filename = e.target.getAttribute('data-file');
    switch (e.target.id) {
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
