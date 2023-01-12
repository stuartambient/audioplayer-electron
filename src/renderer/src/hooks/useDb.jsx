import { useState, useEffect } from 'react';
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
    const loadTracks = async () => {
      let success = true;
      setTracksLoading(true);
      setTracksError(false);
      const trackRequest = await window.api.getTracks(tracksPageNumber, tracksSearchTerm);
      if (trackRequest) {
        /* console.log('tr: ', trackRequest); */
        setTracks((prevTracks) => {
          return [...prevTracks, ...trackRequest];
        });
        setHasMoreTracks(trackRequest.length > 0);
        setTracksLoading(false);
      }
    };
    loadTracks();
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
    const loadAlbums = async () => {
      setAlbumsLoading(true);
      setAlbumsError(false);
      const albumRequest = await window.api.getAlbums(albumsPageNumber, albumsSearchTerm);
      if (albumRequest) {
        setAlbums((prevAlbums) => {
          return [...prevAlbums, ...albumRequest];
        });
        setHasMoreAlbums(albumRequest.length > 0);
        setAlbumsLoading(false);
      }
    };
    loadAlbums();
  }, [albumsPageNumber, albumsSearchTerm]);

  return { albumsLoading, albums, setAlbums, hasMoreAlbums, albumsError };
};

const useAlbumTracks = (pattern) => {
  const [albumTracks, setAlbumTracks] = useState([]);
  const [error, setError] = useState([]);

  useEffect(() => {
    const loadAlbumTracks = async () => {
      const albumTracksRequest = await window.api.getAlbumTracks(pattern);
      setAlbumTracks(albumTracksRequest);
    };
    loadAlbumTracks();
  }, [pattern]);
  return { albumTracks, setAlbumTracks };
};

export { useTracks, useAlbums, useAlbumTracks };
