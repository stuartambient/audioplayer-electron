import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTracksByRoot } from '../hooks/useDb';
/* import { FixedSizeList as List } from 'react-window'; */
import List from './List';
import { openChildWindow } from './ChildWindows/openChildWindow';
/* import AGGrid from '../table/AGGrid'; */
/* import Row from './Row'; */

import {
  useTotalTracksStat,
  useTopHundredArtistsStat,
  useGenres,
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
          resizeable: true,
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
      openChildWindow(
        'table-data',
        'top-genres',
        {
          width: 1200,
          height: 550,
          show: false,
          resizeable: true,
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

export const AlbumsByRoot = ({ albums }) => (
  <List
    data={albums}
    height={600} // Specify the desired height of the list
    itemSize={50} // Specify the height of each item in the list
    width="100%" // Specify the desired width of the list
    className="stats--list"
    /* onClick={getGenres} */
    stat="stat-albums"
  />
);

export const TracksByRoot = ({ root }) => {
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
          resizeable: true,
          preload: 'metadataEditing',
          sandbox: false,
          webSecurity: false,
          contextIsolation: true
        },
        tracks
      );
    }
  }, [tracks]);
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
