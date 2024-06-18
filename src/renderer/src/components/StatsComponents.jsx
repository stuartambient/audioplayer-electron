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

const initTable = async (type, data = null) => {
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

const tableStatus = async () => {
  try {
    const openTable = await window.api.checkForOpenTable('table-data');
    if (openTable) {
      await window.api.clearTable();

      return true;
    }
  } catch (e) {
    return e.message;
  }
  return false;
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

const useArtist = (artist) => {
  useEffect(() => {
    let isSubscribed = true;
    const getTable = async () => {
      const tableStat = await tableStatus();
      if (!tableStat) {
        initTable('artist-tracks');
      }
      const results = await window.api.getTracksByArtist(artist, 'artist-tracks');
    };
    if (isSubscribed && artist) getTable();
    return () => {
      isSubscribed = false;
    };
  }, [artist]);
};

export const TopHundredArtists = () => {
  const { topHundredArtists } = useTopHundredArtistsStat();
  const [artist, setArtist] = useState('');

  useArtist(artist);
  const getArtistTracks = async (e) => {
    setArtist(e.target.id);
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
    const getTable = async () => {
      const tableStat = await tableStatus();
      if (!tableStat) {
        initTable('genre-tracks');
      }
      const results = await window.api.getTracksByGenre(genre, 'genre-tracks');
    };
    if (isSubscribed && genre) getTable();
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

const useAlbum = (album) => {
  useEffect(() => {
    let isSubscribed = true;
    const getTable = async () => {
      const tableStat = await tableStatus();
      if (!tableStat) {
        initTable('album-tracks');
      }
      const results = await window.api.getTracksByAlbum(album, 'album-tracks');
    };
    if (isSubscribed && album) getTable();
    return () => {
      isSubscribed = false;
    };
  }, [album]);
};

export const AlbumsByRoot = ({ albums, amountLoaded }) => {
  const [album, setAlbum] = useState('');
  useAlbum(album);
  const getAlbum = async (e) => {
    console.log(e.target.id);
    setAlbum(e.target.id);
  };
  return (
    <List
      data={albums}
      height="100%" // Specify the desired height of the list
      /* itemSize={50} // Specify the height of each item in the list */
      width="100%" // Specify the desired width of the list
      className="stats--list"
      onClick={getAlbum}
      stat="stat-albums"
      amountLoaded={amountLoaded}
    />
  );
};

export const TracksByRoot = ({ root }) => {
  useEffect(() => {
    let isSubscribed = true;
    const getTable = async () => {
      const tableStat = await tableStatus();
      if (!tableStat) {
        initTable('root-tracks');
      }
      const tracksResult = await window.api.getTracksByRoot(root, 'root-tracks');
    };
    getTable();
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
