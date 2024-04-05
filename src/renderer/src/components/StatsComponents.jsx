import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
/* import { FixedSizeList as List } from 'react-window'; */
import List from './List';
/* import Row from './Row'; */

import {
  useTotalTracksStat,
  useTopHundredArtistsStat,
  useGenres,
  useFolder,
  useNullMeta
} from '../hooks/useDb';

export const TotalMedia = () => {
  const [totalTracks, setTotalTracks] = useState();
  const req = useTotalTracksStat(setTotalTracks);
  return (
    <>
      {totalTracks ? (
        <div className="stats--totalmedia">
          <h1>{totalTracks.tracks} tracks</h1>
          <h3> in </h3>
          <h1>{totalTracks.albums} albums</h1>
        </div>
      ) : null}
    </>
  );
};

const openChildWindow = (name, type, data) => {
  window.api.showChild({
    name: name,
    winConfig: {
      width: 1200,
      height: 550,
      show: false,
      resizable: true,
      preload: 'metadataEditing',
      sandbox: false,
      webSecurity: false,
      contextIsolation: true
    },
    data: { listType: type, results: data }
  });
};
export const TopHundredArtists = () => {
  const { topHundredArtists } = useTopHundredArtistsStat();
  const getArtistTracks = async (e) => {
    const artist = e.target.id;
    console.log('artists, e.target id: ', artist);
    const results = await window.api.getTracksByArtist(artist);
    if (results) {
      openChildWindow('table-data', 'top-artists', results);
    }
  };

  return (
    <List
      data={topHundredArtists}
      height={600} // Specify the desired height of the list
      itemSize={50} // Specify the height of each item in the list
      width="100%" // Specify the desired width of the list
      className="stats--list"
      onClick={getArtistTracks}
      stat="stat-artists"
    />
  );
};

export const Genres = () => {
  const [genres, setGenres] = useState([]);
  useGenres(setGenres);
  const getGenres = async (e) => {
    const genre = e.target.id;
    const results = await window.api.getTracksByGenre(genre);
    if (results) {
      openChildWindow('table-data', 'top-genres', results);
    }
  };

  return (
    <List
      data={genres}
      height={600} // Specify the desired height of the list
      itemSize={50} // Specify the height of each item in the list
      width="100%" // Specify the desired width of the list
      className="stats--list"
      onClick={getGenres}
      stat="stat-genres"
    />
  );
};

export const ExpandedRoot = ({ expandFolder }) => {
  console.log(expandFolder);
  const [activeAlbums, setActiveAlbums] = useState({ folder: null, albums: [] });
  const getAlbumsByTopFolder = async (expandFolder) => {
    //console.log('folder: ', folder);
    const results = await window.api.getAlbumsByTopFolder(expandFolder);
    if (results) {
      console.log(results);
      setActiveAlbums({ folder, albums: results });
    }
    getAlbumsByTopFolder(expandFolder);
  };

  return (
    <List
      data={activeAlbums}
      height={600}
      itemSize={50}
      width="100%"
      className="stats--albums"
      onClick={() => console.log('need click')}
      stat="stat-album"
    ></List>
  );
};

export const FolderTracks = ({ directories, expandList, setExpandList, setExpandFolder }) => {
  const [folderTracks, setFolderTracks] = useState([]);

  useFolder(setFolderTracks, directories);

  useEffect(() => {
    if (!expandList) {
      setExpandFolder('');
    }
  }, [expandList]);

  const getRootTracks = async (folder) => {
    const root = folder;
    console.log(root);
    const results = await window.api.getTracksByFolder(root);
    if (results) {
      openChildWindow('table-data', 'top-folders', results);
    }
  };

  const handleFolderStatClick = (e) => {
    e.preventDefault();
    if (e.target.id.endsWith('--expand')) {
      const folder = e.target.id.split('--')[0];
      setExpandList(!expandList);

      setExpandFolder(folder);
    } else if (e.target.id) {
      getRootTracks(e.target.id);
    }
  };

  return (
    <List
      data={folderTracks}
      height={600}
      itemSize={50}
      width="100%"
      className="stats--list"
      onClick={handleFolderStatClick}
      stat="stat-folder"
    ></List>
  );
};

/* const genreList = genres.map((genre) => {
    if (!genre.genre) return;
    return (
      <li className="stats--genres-genre">
        <span className="genre-count">{genre['COUNT(genre)']}</span>
        <span className="genre-name">{genre.genre}</span>
      </li>
    );
  }); */
/* return <ul className="stats--genres">{genreList}</ul>; */
//};

export const NullMetadata = () => {
  const [tracks, setTracks] = useState();
  useNullMeta(setTracks);
  useEffect(() => {
    if (tracks) {
      console.log(tracks);
    }
  }, [tracks]);
};
