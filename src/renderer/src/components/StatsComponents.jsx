import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
/* import { FixedSizeList as List } from 'react-window'; */
import List from './List';
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
  const [artistTracks, setArtistTracks] = useState({ artist: '', results: [] });

  const getArtistTracks = async (e) => {
    console.log(e);
    const artist = e.target.id;
    const results = await window.api.getTracksByArtist(artist);
    /* setArtistTracks({ artist, results }); */
    setTimeout(async () => await window.api.showList('top-artists', results), 1000);
  };

  /*   const Row = ({ index, style }) => {
    const tt = topHundredArtists[index];

    const rowStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '50px',
      backgroundColor: index % 2 === 0 ? 'hsl(0, 0%, 13%)' : 'rgb(55, 71, 79)'
    };

    const artistNameStyles = {
      marginLeft: '10px',
      fontWeight: 'bold'
    };

    const countStyles = {
      marginRight: '10px',
      cursor: 'pointer'
    };

    return (
      <div style={{ ...style, ...rowStyles }}>
        <span style={artistNameStyles}>{tt.artist}</span>
        <span id={tt.artist} onClick={getArtistTracks} style={countStyles}>
          {tt.count}
        </span>
        {artistTracks.artist === tt.artist && artistTracks.results && (
          <ul>
            {artistTracks.results.map((track) => {
              return <li>{track.audiofile}</li>;
            })}
          </ul>
        )}
      </div>
    );
  }; */

  return (
    <List
      data={topHundredArtists}
      height={600} // Specify the desired height of the list
      /* itemCount={topHundredArtists.length} */ // Total number of items in the list
      itemSize={50} // Specify the height of each item in the list
      width="100%" // Specify the desired width of the list
      className="stats--list"
      onClick={getArtistTracks}
    />
  );
};

export const Genres = () => {
  const [genres, setGenres] = useState([]);
  useGenres(setGenres);

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
