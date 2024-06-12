import { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
/* import { FixedSizeList as List } from 'react-window'; */
import List from './List';
import { openChildWindow } from './ChildWindows/openChildWindow';
import {
  useTotalTracksStat,
  useTopHundredArtistsStat,
  useGenres,
  useTracksByRoot
} from '../hooks/useDb';
/* import AGGrid from '../table/AGGrid'; */
/* import Row from './Row'; */

/* export const TotalMedia = ({ totalTracks }) => {
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
}; */

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

/* export const TopHundredArtists = ({ topArtists }) => {
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
          show: true,
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
      data={topArtists}
      height="100%" // Specify the desired height of the list
      width="100%"
      className="stats--list"
      onClick={getArtistTracks}
      stat="stat-artists"
    />
  );
}; */

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

/* export const Genres = ({ allGenres }) => {
  const getGenres = async (e) => {
    const genres = e.target.id;
    const results = await window.api.getTracksByGenres(genres);
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
    }
  };

  return (
    <List
      height="100%"
      width="100%"
      className="stats--list"
      data={allGenres}
      onClick={getGenres}
      stat="stat-genres"
    />
  );
}; */

export const Genres = () => {
  const [genres, setGenres] = useState([]);
  useGenres(setGenres);
  const getGenres = async (e) => {
    const genre = e.target.id;
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
    }
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
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    let isSubscribed = true;
    const openTable = async () => {
      const openTable = await window.api.checkForOpenTable('table-data');
      if (openTable) {
        await window.api.clearTable();
      } else {
        await openChildWindow('table-data', 'root-tracks', {
          width: 1200,
          height: 550,
          show: false,
          resizable: true,
          preload: 'metadataEditing',
          sandbox: false,
          webSecurity: false,
          contextIsolation: true
        });
      }

      const tracksResult = await window.api.getTracksByRoot(root);

      await openChildWindow(
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
        tracksResult
      );
    };
    openTable();
    return () => {
      isSubscribed = false;
    };
  }, [root, tracks]);
};
