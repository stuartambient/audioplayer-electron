import { useState } from 'react';
import { useTotalTracksStat, useTopTenArtistsStat, useGenres } from '../hooks/useDb';

export const TotalTracks = () => {
  const { totalTracks } = useTotalTracksStat();

  return <>{totalTracks}</>;
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

  const genreList = genres.map((genre) => {
    if (!genre.genre) return;
    return <li>{genre.genre}</li>;
  });
  return <ul className="stat--genres">{genreList}</ul>;
};
