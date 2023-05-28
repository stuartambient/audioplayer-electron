import { useTotalTracksStat, useTopTenArtistsStat } from '../hooks/useDb';

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
