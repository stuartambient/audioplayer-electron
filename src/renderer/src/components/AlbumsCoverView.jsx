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

  const compareStrs = (str1, str2) => {
    // STR1 IS FOLDER, STR2 IS TITLE FROM API
    const str2split = str2
      .replace('-', '')
      .split(' ')
      .filter((s) => s !== '');
    let correct = { total: str2split.length, failed: 0 };
    for (const a of str1) {
      const dropHyphen = a.split('-')[0].trim();
      if (!str2.toLowerCase().includes(dropHyphen.toLowerCase())) {
        correct.failed += 1;
      }
    }
    const percentage = 100 - (correct.failed / correct.total) * 100;
    return percentage;
  };

  /*   const cleanString = () => {
    let title, artist;
    artist = search.album.split('-')[0].replaceAll(/\W/g, ' ').replaceAll('and', ' ');
    title = search.album.split('-')[1].replaceAll(/\W/g, ' ').replaceAll('and', ' ');
  }; */

  const handleCoverSearch = async (search) => {
    let title, artist, url, mbUrl;
    if (search.album.split(' ').includes('-')) {
      artist = search.album.split('-')[0].replaceAll(/\W/g, ' ').replaceAll('and', ' ');
      title = search.album.split('-')[1].replaceAll(/\W/g, ' ').replaceAll('and', ' ');
      console.log('artist: ', artist, 'title: ', title);
    }

    const discogsResults = { path: search.path, album: search.album, results: [] };
    const musicBrainzResults = {
      path: search.path,
      album: search.album,
      mbresults: []
    };
    if (title) {
      url = `https://api.discogs.com/database/search?title=${title}&release_title=${title}&artist=${artist}&token=${
        import.meta.env.RENDERER_VITE_DISCOGS_KEY
      }`;
    } else {
      url = `https://api.discogs.com/database/search?q=${search.album}&token=${
        import.meta.env.RENDERER_VITE_DISCOGS_KEY
      }`;
    }
    await axios
      .get(url)
      .then(async (response) => {
        console.log('discogs - response: ', response);
        response.data.results.forEach((r) => {
          let tmp = search.album.split(' ').filter((f) => f !== '-');
          let compare = compareStrs(tmp, r.title);
          if (compare > 30) discogsResults.results.push(r);
        });
      })
      .catch((err) => {
        console.log(err);
      });

    await axios
      .get(`http://musicbrainz.org/ws/2/release-group/?query=${search.album}&limit=1`)
      .then(async (response) => {
        /* console.log('musicbrainz - release-group - response: ', response); */
        const artists = response.data['release-groups'][0]['artist-credit'];
        const allartists = artists.map((a) => a.name);
        const album = response.data['release-groups'][0].title;
        const mbTitle = `${allartists.join(',')} - ${album}`;
        const rels = response.data['release-groups'][0].releases;

        for await (const rel of rels) {
          axios
            .get(`http://coverartarchive.org/release/${rel.id}`)
            .catch((error) => {
              if (error.response) {
                return Promise.reject(error);
              }
            })
            .then((response) => {
              musicBrainzResults.mbresults.push({
                title: mbTitle,
                images: response.data.images[0]
              });
            })
            .catch((err) => `Errrrror: ${err}`);
        }
      });

    /* setTimeout(() => window.api.showChild({ ...discogsResults, ...musicBrainzResults }), 1000); */
    window.api.showChild({
      name: 'cover-search-window',
      winConfig: {
        width: 450,
        height: 550,
        show: false,
        resizable: false,

        /* preload: path.join(__dirname, '../preload/child.js'), */
        preload: 'coverSearch',
        sandbox: false,
        webSecurity: false,
        contextIsolation: true
      },
      data: { ...discogsResults, ...musicBrainzResults }
    });
  };

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
      console.log('album: ', album, 'refAlbum: ', refAlbum);
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
