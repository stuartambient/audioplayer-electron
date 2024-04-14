/* SELECT foldername FROM albums ORDER BY datecreated DESC LIMIT 10 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useAudioPlayer } from '../AudioPlayerContext';
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useAllAlbumsCovers } from '../hooks/useDb';
import { BsThreeDots } from 'react-icons/bs';
import { GiPauseButton, GiPlayButton } from 'react-icons/gi';
import NoImage from '../assets/noimage.jpg';
import ViewMore from '../assets/view-more-alt.jpg';
import AppState from '../hooks/AppState';

const AlbumsCoverView = ({ resetKey }) => {
  const { state, dispatch } = useAudioPlayer();
  const [coverUpdate, setCoverUpdate] = useState({ path: '', file: '' });
  const [viewMore, setViewMore] = useState(false);
  const [coverSearch, setCoverSearch] = useState();

  const coversObserver = useRef();

  const { coversLoading, hasMoreCovers, coversError } = useAllAlbumsCovers(
    state.coversPageNumber,
    state.coversSearchTerm,
    dispatch,
    resetKey,
    state.covers.length
  );

  useEffect(() => {
    const cover = async () => {
      await window.api.onRefreshHomeCover((e) => {
        setCoverUpdate({ path: e[0], file: e[1] });
      });
    };
    cover();
  }, [state.covers]);

  const compareStrings = (folderName, apiTitle) => {
    const apiTitleParts = apiTitle
      .replace('-', '')
      .split(' ')
      .filter((s) => s !== '');
    let matchStats = { total: apiTitleParts.length, failed: 0 };
    folderName.split(' ').forEach((part) => {
      const searchTerm = part.split('-')[0].trim().toLowerCase();
      if (!apiTitle.toLowerCase().includes(searchTerm)) {
        matchStats.failed += 1;
      }
    });
    return 100 - (matchStats.failed / matchStats.total) * 100;
  };

  // Function to fetch from Discogs API
  const fetchFromDiscogs = async (artist, title, token) => {
    const baseUrl = `https://api.discogs.com/database/search?token=${token}`;
    const url =
      artist && title
        ? `${baseUrl}&title=${encodeURIComponent(title)}&release_title=${encodeURIComponent(
            title
          )}&artist=${encodeURIComponent(artist)}`
        : `${baseUrl}&q=${encodeURIComponent(title || artist)}`;
    try {
      const response = await axios.get(url);
      console.log('discogs response: ', response.data);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching from Discogs:', error);
      return [];
    }
  };

  // Function to fetch from MusicBrainz and Cover Art Archive
  const fetchFromMusicBrainz = async (searchAlbum) => {
    const mbResults = [];
    try {
      const mbResponse = await axios.get(
        `http://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(
          searchAlbum
        )}&limit=1`
      );
      /* console.log('mb response: ', mbResponse); */
      /*       const artists = mbResponse.data['release-groups'][0]['artist-credit']
        .map((a) => a.name)
        .join(',');
      const album = mbResponse.data['release-groups'][0].title; */
      const releases = mbResponse.data['release-groups'][0].releases;
      for (const release of releases) {
        try {
          const releaseInfo = await axios.get(
            `http://musicbrainz.org/ws/2/release/${release.id}?inc=artist-credits+labels+discids+recordings`
          );
          if (releaseInfo.data['cover-art-archive'].artwork) {
            const coverResponse = await axios.get(
              `http://coverartarchive.org/release/${release.id}`
            );

            const artist = searchAlbum.split(' - ')[0];
            const title = searchAlbum.split(' - ')[1];

            mbResults.push({
              releaseId: release.id,
              coverResponse: coverResponse.data.images.map((img) => {
                return {
                  image: img.image,
                  thumbnails: img.thumbnails
                };
              }),
              /* thumbnails: coverResponse.data.images[0].thumbnails, */
              title: releaseInfo.data.title,
              artist: releaseInfo.data['artist-credit'].map((n) => {
                return {
                  artist: n.artist.name
                };
              }),
              barcode: releaseInfo.data.barcode,
              country: releaseInfo.data.country,
              date: releaseInfo.data.date,
              labelInfo: releaseInfo.data['label-info'].map((l) => {
                return {
                  label: l.label.name
                };
              }),
              media: releaseInfo.data.media.map((m) => {
                return {
                  trackCount: m['track-count']
                };
              }),
              releaseEvents: releaseInfo.data['release-events'].map((r) => {
                return {
                  country: r.country
                };
              })
            });
          }
        } catch (error) {
          console.log(`Error fetching cover art for release ${release.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error fetching from MusicBrainz:', error);
    }
    return mbResults;
  };

  // Main function to handle cover search
  const handleCoverSearch = async (search) => {
    /*  console.log('search: ', search); */
    const { album, path } = search;
    let artist, title;
    if (album.includes('-')) {
      [artist, title] = album
        .split('-')
        .map((part) => part.replaceAll(/\W/g, ' ').replaceAll('and', ' '));
    } else {
      title = album;
    }

    const discogsToken = import.meta.env.RENDERER_VITE_DISCOGS_KEY;
    const discogsResults = await fetchFromDiscogs(artist, title, discogsToken);
    const musicBrainzResults = await fetchFromMusicBrainz(album);

    // Example of showing results - adjust according to your application's needs
    /* console.log('Discogs Results:', discogsResults); */
    /* console.log('MusicBrainz & Cover Art Results:', musicBrainzResults); */

    // Implement the logic to display or use the results as needed
    /*   const results = discogsResults.concat(musicBrainzResults);
    console.log('results from cover searches: ', results); */
    console.log(musicBrainzResults);
    setTimeout(() => window.api.showChild(musicBrainzResults), 1000);
  };

  // Example usage
  /*   handleCoverSearch({ album: 'Artist - Album Title', path: '/path/to/album' }); */

  /* EFECT FOR RELOADING COVER IMAGE WHEN IMAGE IS UPDATED */
  useEffect(() => {
    if (coverUpdate.path !== '') {
      const updateCovers = state.covers.map((cover) => {
        if (cover.fullpath === coverUpdate.path) {
          cover.img = coverUpdate.file;
        }
      });
    }
  });

  useEffect(() => {
    const sendCovers = async () => {
      await window.api.showChild(coverSearch);
    };
    if (coverSearch) sendCovers();
  }, [coverSearch]);

  const handleAlbumToPlaylist = async (path) => {
    const albumTracks = await window.api.getAlbumTracks(path);
    if (albumTracks) {
      dispatch({
        type: 'play-album',
        playlistTracks: albumTracks
      });
    }
  };

  const handlePlayReq = async (e) => {
    const albumPath = e.currentTarget.getAttribute('fullpath');
    const albumTracks = await window.api.getAlbumTracks(albumPath);
    if (albumTracks) {
      dispatch({
        type: 'play-album',
        playlistTracks: albumTracks
      });
    }
  };

  const handleContextMenuOption = async (option, path, album) => {
    if (option[0] === 'search for cover') {
      const regex = /(\([^)]*\)|\[[^\]]*\]|\{[^}]*\})/g;

      const refAlbum = album.replace(regex, '');
      /*       console.log('album: ', album, 'refAlbum: ', refAlbum); */
      handleCoverSearch({ path: path, album: refAlbum });
      /* setCoverSearch({ path: path, album: refAlbum.join(' ') }); */
    } else if (option[0] === 'add album to playlist') {
      handleAlbumToPlaylist(path);
    } else if (option[0] === 'open album folder') {
      await window.api.openAlbumFolder(path);
    }
  };

  const lastCoverElement = useCallback(
    (node) => {
      if (coversLoading) return;
      if (coversObserver.current) coversObserver.current.disconnect();
      coversObserver.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreCovers) {
            dispatch({
              type: 'set-covers-pagenumber',
              coversPageNumber: state.coversPageNumber + 1
            });
          }
        },
        {
          root: document.querySelector('.albums-coverview'),
          threshold: 1.0
        }
      );
      if (node) coversObserver.current.observe(node);
    },
    [coversLoading, hasMoreCovers]
  );

  useEffect(() => {
    if (!coversObserver.current && state.covers.length > 0) {
      dispatch({
        type: 'set-covers-pagenumber',
        coversPageNumber: state.coversPageNumber + 1
      });
    }
  }, [coversObserver]);

  const handleContextMenu = async (e) => {
    e.preventDefault();
    const pathToAlbum = e.currentTarget.getAttribute('fullpath');
    const album = e.currentTarget.getAttribute('album');
    await window.api.showAlbumCoverMenu();
    await window.api.onAlbumCoverMenu((e) => handleContextMenuOption(e, pathToAlbum, album));
  };

  return (
    <section className="albums-coverview">
      <ul className="albums-coverview--albums">
        {state.covers.length > 0 &&
          state.covers.map((cover, idx) => {
            return (
              <li key={uuidv4()} ref={state.covers.length === idx + 1 ? lastCoverElement : null}>
                {cover.img && <img src={cover.img} alt="" />}
                {!cover.img && <img src={NoImage} alt="" />}
                <div className="overlay">
                  <span id={cover.fullpath}>{cover.foldername}</span>

                  <div
                    className="item-menu"
                    id={cover.fullpath}
                    fullpath={cover.fullpath}
                    album={cover.foldername}
                  >
                    <BsThreeDots
                      onClick={handleContextMenu}
                      id={cover.fullpath}
                      fullpath={cover.fullpath}
                      album={cover.foldername}
                    />
                  </div>
                  <span id="coverplay" fullpath={cover.fullpath} onClick={handlePlayReq}>
                    <GiPlayButton />
                  </span>
                </div>
              </li>
            );
          })}
      </ul>
    </section>
  );
};

export default AlbumsCoverView;

/* 
This is a React component that renders an album cover view. I can offer some feedback and suggestions to improve this code:

    It's a good practice to format the code to make it more readable, so consider using an auto-formatter to indent the code consistently.
    In the second useEffect hook, it's good to add the dependency coverUpdate to prevent unnecessary executions of the code when the state doesn't change.
    The compareStrs function could use some refactoring to make it more readable and maintainable. For example, you could break down the code into smaller, reusable functions or variables with descriptive names.
    Consider adding comments to explain what each function does and why it exists.
    There's a typo in the EFECT comment. It should be EFFECT.

    In the third useEffect hook, the updateCovers array is created but not used. You need to assign it back to the covers state.
In the handleCoverSearch function, it's better to use let and const instead of var to declare variables to improve readability and avoid unexpected behaviors.
In the same function, you could use string interpolation to concatenate strings instead of using the + operator.
In the handleCoverSearch function, there's a hardcoded timeout of one second to call the window.api.showChild function. Instead, you could use setTimeout to make it more flexible, allowing you to pass the timeout value as an argument.
Finally, it's better to split large functions into smaller ones with a single responsibility to improve the code's maintainability and readability.




*/
