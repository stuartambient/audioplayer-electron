import { useState, useEffect, useMemo } from 'react';
/* import axios from "axios"; */

/* const client = axios.create({
  baseURL: "http://localhost:3008/",
  proxy: false,
}); */

const useTracks = (tracksPageNumber, tracksSearchTerm, sortType) => {
  const [tracksLoading, setTracksLoading] = useState(true);
  const [tracksError, setTracksError] = useState(false);
  const [tracks, setTracks] = useState([]);
  /*   const [albums, setAlbums] = useState([]); */
  const [hasMoreTracks, setHasMoreTracks] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    const loadTracks = async () => {
      let success = true;
      setTracksLoading(true);
      setTracksError(false);
      let trackRequest = await window.api.getTracks(tracksPageNumber, tracksSearchTerm);
      if (trackRequest && isSubscribed) {
        /* console.log('tr: ', trackRequest); */
        setTracks((prevTracks) => {
          return [...prevTracks, ...trackRequest];
        });
        setHasMoreTracks(trackRequest.length > 0);
        setTracksLoading(false);
      }
      return () => console.log('files found');
    };

    loadTracks();
    return () => (isSubscribed = false);
  }, [tracksPageNumber, tracksSearchTerm]);

  return { tracksLoading, tracks, setTracks, hasMoreTracks, tracksError };
};

const useAlbums = (albumsPageNumber, albumsSearchTerm) => {
  const [albumsLoading, setAlbumsLoading] = useState(true);
  const [albumsError, setAlbumsError] = useState(false);
  const [albums, setAlbums] = useState([]);
  /*   const [albums, setAlbums] = useState([]); */
  const [hasMoreAlbums, setHasMoreAlbums] = useState(false);

  useEffect(() => {
    let isSubscribed = true;
    const loadAlbums = async () => {
      setAlbumsLoading(true);
      setAlbumsError(false);
      const albumRequest = await window.api.getAlbums(albumsPageNumber, albumsSearchTerm);
      if (albumRequest && isSubscribed) {
        setAlbums((prevAlbums) => {
          return [...prevAlbums, ...albumRequest];
        });
        setHasMoreAlbums(albumRequest.length > 0);
        setAlbumsLoading(false);
      }
    };
    loadAlbums();
    return () => (isSubscribed = false);
  }, [albumsPageNumber, albumsSearchTerm]);

  return { albumsLoading, albums, setAlbums, hasMoreAlbums, albumsError };
};

const useAlbumTracks = (pattern) => {
  const [albumTracks, setAlbumTracks] = useState([]);
  const [error, setError] = useState([]);

  useEffect(() => {
    let subscribed = true;
    const loadAlbumTracks = async () => {
      const albumTracksRequest = await window.api.getAlbumTracks(pattern);
      if (albumTracksRequest && subscribed) {
        setAlbumTracks(albumTracksRequest);
      }
    };
    loadAlbumTracks();
    return () => (subscribed = false);
  }, [pattern]);
  return { albumTracks, setAlbumTracks };
};

export { useTracks, useAlbums, useAlbumTracks };
