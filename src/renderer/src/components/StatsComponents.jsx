import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { VariableSizeList as List } from 'react-window';

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
  const [artistTracks, setArtistTracks] = useState({ artist: '', results: [] });

  function itemSize(index) {
    return index % 2 ? 50 : 25;
  }

  const getArtistTracks = async (e) => {
    const artist = e.target.id;
    const results = await window.api.getTracksByArtist(artist);
    setArtistTracks({ artist, results });
  };
  const artists = topHundredArtists.map((tt) => {
    return (
      <li key={uuidv4()}>
        <span>{tt.artist}</span>
        <span
          id={tt.artist}
          onClick={getArtistTracks}
          style={{ marginLeft: '5%', cursor: 'pointer' }}
        >
          {tt.count}
        </span>
        {artistTracks.artist === tt.artist && artistTracks.results && (
          <ul>
            {artistTracks.results.map((track) => {
              return <li>{track.audiofile}</li>;
            })}
          </ul>
        )}
      </li>
    );
  });
  return <ul>{artists}</ul>;
};

export const Genres = () => {
  const [genres, setGenres] = useState([]);
  useGenres(setGenres);
  useEffect(() => {
    if (genres) console.log(genres['COUNT(genre)']);
  }, [genres]);

  const genreList = genres.map((genre) => {
    if (!genre.genre) return;
    return (
      <li className="stats--genres-genre">
        <span className="genre-count">{genre['COUNT(genre)']}</span>
        <span className="genre-name">{genre.genre}</span>
      </li>
    );
  });
  return <ul className="stats--genres">{genreList}</ul>;
};

export const NullMetadata = () => {
  const [tracks, setTracks] = useState();
  useNullMeta(setTracks);
  useEffect(() => {
    if (tracks) {
      console.log(tracks);
    }
  }, [tracks]);
};
