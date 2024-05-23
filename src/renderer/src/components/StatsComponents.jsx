import { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
/* import { useTracksByRoot } from '../hooks/useDb'; */
/* import { FixedSizeList as List } from 'react-window'; */
import List from './List';
import { openChildWindow } from './ChildWindows/openChildWindow';
/* import AGGrid from '../table/AGGrid'; */
/* import Row from './Row'; */

import { useGenres } from '../hooks/useDb';

export const TotalMedia = ({ totalTracks }) => {
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

export const TopHundredArtists = ({ topArtists }) => {
  /*   console.log('TopHundredArtists');
  const { topHundredArtists } = useTopHundredArtistsStat(); */
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
      data={topArtists}
      height="100%" // Specify the desired height of the list
      width="100%"
      className="stats--list"
      onClick={getArtistTracks}
      stat="stat-artists"
    />
  );
};

export const Genres = ({ allGenres }) => {
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
