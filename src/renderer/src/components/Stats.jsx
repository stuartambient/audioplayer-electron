import { useState, useEffect } from 'react';
import { useTotalTracksStat, useTopTenArtistsStat } from '../hooks/useDb';

const Stats = () => {
  const { totalTracks } = useTotalTracksStat();
  const { topTenArtists } = useTopTenArtistsStat();

  return (
    <ul
      style={{
        gridColumn: '2 / 3',
        color: 'white',
        listStyle: 'none',
        alignSelf: 'center',
        justifySelf: 'center'
      }}
    >
      <li>Total tracks: </li>
      <li>Total albums: </li>
      <li>Top 10 Artists: </li>
    </ul>
  );
};

export default Stats;
