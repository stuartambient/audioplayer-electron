/* SELECT foldername FROM albums ORDER BY datecreated DESC LIMIT 10 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useAudioPlayer } from '../AudioPlayerContext';
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useAllAlbumsCovers } from '../hooks/useDb';
import { AlbumArt } from '../utility/AlbumArt';
import { BsThreeDots } from 'react-icons/bs';
import { GiPauseButton, GiPlayButton } from 'react-icons/gi';
import NoImage from '../assets/noimage.jpg';
import ViewMore from '../assets/view-more-alt.jpg';
/* import AppState from '../hooks/AppState'; */
import { openChildWindow } from './ChildWindows/openChildWindow';

const AlbumsCoverView = ({ resetKey }) => {
  const { state, dispatch } = useAudioPlayer();
  /*  const [coverUpdate, setCoverUpdate] = useState({ path: '', file: '' }); */
  const [viewMore, setViewMore] = useState(false);
  /* const [coverSearch, setCoverSearch] = useState(); */
  const [coverPath, setCoverPath] = useState('');

  const coversObserver = useRef();

  const { coversLoading, hasMoreCovers, coversError } = useAllAlbumsCovers(
    state.coversPageNumber,
    state.coversSearchTerm,
    dispatch,
    resetKey,
    state.covers.length
  );

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
  const fetchFromDiscogs = async (path, artist, title, token, key, secret) => {
    /* const baseUrl = `https://api.discogs.com/database/search?token=${token}`; */
    const baseUrl = `https://api.discogs.com/database/search?key=${key}&secret=${secret}`;
    const url =
      artist && title
        ? `${baseUrl}&title=${encodeURIComponent(title)}&release_title=${encodeURIComponent(
            title
          )}&artist=${encodeURIComponent(artist)}`
        : `${baseUrl}&q=${encodeURIComponent(title || artist)}`;
    try {
      /* console.log('discogs url: ', url); */
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'musicplayer-electron/1.0 +https://stuartambient.github.io/musicapp-intro/'
        }
      });
      /* console.log('response: ', response.data.results); */
      return response.data.results.map(
        (item) =>
          new AlbumArt({
            releaseId: item.id,
            savePath: path,
            coverResponse: [{ image: item.cover_image, thumbnails: { small: item.thumb } }],
            title: item.title.split('-')[1],
            artist: [{ artist: item.title.split('-')[0] }],
            barcode: item.barcode[0],
            country: item.country,
            date: item.year,
            labelInfo: item.label.map((lab, index) => ({ label: lab }))
          })
      );

      /* return response.data.results; */
    } catch (error) {
      console.error('Error fetching from Discogs:', error);
      return [];
    }
  };

  // Function to fetch from MusicBrainz and Cover Art Archive
  const fetchFromMusicBrainz = async (path, searchAlbum) => {
    const mbResults = [];
    try {
      const mbResponse = await axios.get(
        `http://musicbrainz.org/ws/2/release-group/?query=${encodeURIComponent(
          searchAlbum
        )}&limit=1`
      );
      console.log('mbrainz release-groups[0]: ', mbResponse.data['release-groups']);
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
            mbResults.push(
              new AlbumArt({
                releaseId: release.id,
                savePath: path,
                coverResponse: coverResponse.data.images.map((img) => {
                  return {
                    image: img.image,
                    thumbnails: img.thumbnails
                  };
                }),
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
                })
              })
            );
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
    const { album, path, service } = search;
    console.log('path: ', path);

    let artist, title;
    if (album.includes('-')) {
      [artist, title] = album
        .split('-')
        .map((part) => part.replaceAll(/\W/g, ' ').replaceAll('and', ' '));
    } else {
      title = album;
    }

    if (service === 'covit') {
      /* return window.api.searchMusicHoarders(artist, title); */

      return openChildWindow(
        'cover-search-alt',
        'cover-search-alt',
        {
          width: 1400,
          height: 600,
          show: false,
          resizable: true,
          preload: 'coverSearchAlt',
          sandbox: true,
          webSecurity: true,
          contextIsolation: true
        },
        { artist, title, path }
      );
      /* return console.log(search); */
    }

    const discogsKey = import.meta.env.RENDERER_VITE_DISCOGS_CONSUMER_KEY;
    const discogsSecret = import.meta.env.RENDERER_VITE_DISCOGS_CONSUMER_SECRET;
    const discogsToken = import.meta.env.RENDERER_VITE_DISCOGS_KEY;
    const discogsResults = await fetchFromDiscogs(
      path,
      artist,
      title,
      discogsToken,
      discogsKey,
      discogsSecret
    );
    const musicBrainzResults = await fetchFromMusicBrainz(path, album);
    /* console.log('discogs: ', discogsResults);
    console.log('musicbrainz: ', musicBrainzResults); */

    openChildWindow(
      'cover-search',
      'cover-search',
      {
        width: 800,
        height: 600,
        show: false,
        resizable: true,
        preload: 'coverSearch',
        sandbox: false,
        webSecurity: false,
        contextIsolation: true
      },

      [...discogsResults, ...musicBrainzResults]
    );
  };

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
    console.log('option: ', option);
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
    } else if (option[0] === 'cover search') {
      /* console.log('cover - search - engine', option, 'path: ', path, 'album: ', album); */
      const regex = /(\([^)]*\)|\[[^\]]*\]|\{[^}]*\})/g;
      const refAlbum = album.replace(regex, '');
      handleCoverSearch({ path: path, album: refAlbum, service: 'covit' });
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
                {cover.img && <img src={`cover://${cover.img}`} alt="" />}
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
