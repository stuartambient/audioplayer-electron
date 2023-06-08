import { useState, useEffect } from 'react';
import { useTotalTracksStat, useTopTenArtistsStat, useGenres } from '../hooks/useDb';

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

export const TopTenArtists = () => {
  const { topTenArtists } = useTopTenArtistsStat();
  const artists = topTenArtists.map((tt) => {
    return <li>{tt.artist}</li>;
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
