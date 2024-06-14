import { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import List from './List';
import { openChildWindow } from './ChildWindows/openChildWindow';
import {
  useTotalTracksStat,
  useTopHundredArtistsStat,
  useGenres,
  useTracksByRoot
} from '../hooks/useDb';

const openMetadataTables = async (type, data = null) => {
  const name = 'table-data';
  const config = {
    width: 1200,
    height: 550,
    show: false,
    resizable: true,
    preload: 'metadataEditing',
    sandbox: false,
    webSecurity: false,
    contextIsolation: true
  };
  openChildWindow(name, type, config, data);
};

export const TotalMedia = () => {
  const [totalTracks, setTotalTracks] = useState();
  useTotalTracksStat(setTotalTracks);
  return (
    <>
      {totalTracks ? (
        <div className="stats--totalmedia">
          <h1>{totalTracks.tracks} tracks</h1>
          <h3> in </h3>
          <h1>{totalTracks.albums} albums</h1>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </>
  );
};

export const TopHundredArtists = () => {
  const { topHundredArtists } = useTopHundredArtistsStat();
  const getArtistTracks = async (e) => {
    const artist = e.target.id;
    const results = await window.api.getTracksByArtist(artist);
    if (results) {
      openChildWindow(
        'table-data',
        'top-artists',
        {
          width: 1200,
          height: 550,
          show: false,
          resizable: true,
          preload: 'metadataEditing',
          sandbox: false,
          webSecurity: false,
          contextIsolation: true
        },
        results
      );
    }
  };

  return (
    <List
      data={topHundredArtists}
      height="100%" // Specify the desired height of the list
      width="100%"
      className="stats--list"
      onClick={getArtistTracks}
      stat="stat-artists"
    />
  );
};

const useGenre = (genre) => {
  useEffect(() => {
    let isSubscribed = true;
    const openTable = async () => {
      const openTable = await window.api.checkForOpenTable('table-data');
      if (openTable) {
        await window.api.clearTable();
      } else {
        openMetadataTables('top-genres');
      }

      const results = await window.api.getTracksByGenres(genre);
      /* openMetadataTables('root-tracks', tracksResult); */
    };
    if (isSubscribed && genre) openTable();
    return () => {
      isSubscribed = false;
    };
  }, [genre]);
};
export const Genres = () => {
  const [genres, setGenres] = useState([]);
  const [genre, setGenre] = useState('');
  useGenres(setGenres);
  useGenre(genre);
  const getGenres = async (e) => {
    console.log(e.target.id);
    setGenre(e.target.id);
    /*    const genre = e.target.id;
    const results = await window.api.getTracksByGenres(genre);
    if (results) {
      openChildWindow(
        'table-data',
        'top-genres',
        {
          width: 1200,
          height: 550,
          show: false,
          resizable: true,
          preload: 'metadataEditing',
          sandbox: false,
          webSecurity: false,
          contextIsolation: true
        },
        results
      );
    } */
  };

  return (
    <List
      height="100%"
      width="100%"
      className="stats--list"
      data={genres}
      onClick={getGenres}
      stat="stat-genres"
      /* itemSize={50} */
    />
  );
};

export const AlbumsByRoot = ({ albums }) => {
  return (
    <List
      data={albums}
      height="100%" // Specify the desired height of the list
      /* itemSize={50} // Specify the height of each item in the list */
      width="100%" // Specify the desired width of the list
      className="stats--list"
      /* onClick={getGenres} */
      stat="stat-albums"
    />
  );
};

export const TracksByRoot = ({ root }) => {
  useEffect(() => {
    let isSubscribed = true;
    const openTable = async () => {
      const openTable = await window.api.checkForOpenTable('table-data');
      if (openTable) {
        await window.api.clearTable();
      } else {
        openMetadataTables('root-tracks');
      }

      const tracksResult = await window.api.getTracksByRoot(root);
      /*  openMetadataTables('root-tracks', tracksResult); */
    };
    openTable();
    return () => {
      isSubscribed = false;
    };
  }, [root]);
};

/* export const TracksByRoot = ({ root }) => {
  const [tracks, setTracks] = useState([]);
  useTracksByRoot(root, setTracks);

  useEffect(() => {
    if (tracks.length > 0) {
      openChildWindow(
        'table-data',
        'root-tracks',
        {
          width: 1200,
          height: 550,
          show: false,
          resizable: true,
          preload: 'metadataEditing',
          sandbox: false,
          webSecurity: false,
          contextIsolation: true
        },
        tracks
      );
    }
  }, [tracks]);
}; */
