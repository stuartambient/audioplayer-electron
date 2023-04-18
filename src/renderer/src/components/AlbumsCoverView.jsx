/* SELECT foldername FROM albums ORDER BY datecreated DESC LIMIT 10 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useAllAlbumsCovers } from '../hooks/useDb';
import { BsThreeDots } from 'react-icons/bs';
import NoImage from '../assets/noimage.jpg';
import ViewMore from '../assets/view-more-alt.jpg';
import AppState from '../hooks/AppState';

const AlbumsCoverView = ({
  state,
  dispatch,
  covers,
  coversPageNumber,
  coversSearchTerm,
  homepage,
  resetKey
}) => {
  const [coverUpdate, setCoverUpdate] = useState({ path: '', file: '' });
  const [viewMore, setViewMore] = useState(false);
  const [coverSearch, setCoverSearch] = useState();

  const { coversLoading, hasMoreCovers, coversError } = useAllAlbumsCovers(
    coversPageNumber,
    coversSearchTerm,
    dispatch,
    resetKey,
    covers.length
  );

  useEffect(() => {
    const cover = async () => {
      await window.api.onRefreshHomeCover((e) => {
        setCoverUpdate({ path: e[0], file: e[1] });
      });
    };
    cover();
  }, [covers]);

  useEffect(() => {
    if (coverUpdate.path !== '') {
      const updateCovers = covers.map((cover) => {
        if (cover.fullpath === coverUpdate.path) {
          cover.img = coverUpdate.file;
        }
      });
    }
  });

  const compareStrs = (str1, str2) => {
    // STR1 IS FOLDER, STR2 IS TITLE FROM API
    let correct = { total: str2.split(' ').length, failed: 0 };
    for (const a of str1) {
      if (!str2.toLowerCase().includes(a.toLowerCase())) {
        /* console.log(str2, '<------>', a); */
        /* console.log(a); */
        correct.failed += 1;
      }
    }
    const percentage = 100 - (correct.failed / correct.total) * 100;
    /* console.log('total: ', correct.total, 'failed: ', correct.failed); */
    return percentage;
  };

  const handleCoverSearch = async (search) => {
    let title, artist, url;
    if (search.album.split(' ').includes('-')) {
      artist = search.album.split('-')[0];
      title = search.album.split('-')[1];
    }
    const discogsResults = { path: search.path, album: search.album, results: [] };
    const musicBrainzResults = {
      path: search.path,
      album: search.album,
      mbresults: []
    };
    if (title) {
      url = `https://api.discogs.com/database/search?title=${title}&token=${
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
        response.data.results.forEach((r) => {
          /* console.log('discog response: ', r); */
          let tmp = search.album.split(' ').filter((f) => f !== '-');
          let compare = compareStrs(tmp, r.title);
          if (compare > 60) discogsResults.results.push(r);
        });
      })
      .catch((err) => {
        console.log(err);
      });

    await axios
      .get(`http://musicbrainz.org/ws/2/release-group/?query=${search.album}&limit=1`)
      .then(async (r) => {
        const artists = r.data['release-groups'][0]['artist-credit'];
        const allartists = artists.map((a) => a.name);
        const album = r.data['release-groups'][0].title;
        const mbTitle = `${allartists.join(',')} - ${album}`;
        const rels = r.data['release-groups'][0].releases;

        for await (const rel of rels) {
          axios
            .get(`http://coverartarchive.org/release/${rel.id}`)
            .then((r) => {
              /* console.log('mb: ', rel); */
              musicBrainzResults.mbresults.push({ title: mbTitle, images: r.data.images[0] });
            })
            .catch((e) => e);
        }
      });

    setTimeout(() => window.api.showChild({ ...discogsResults, ...musicBrainzResults }), 1000);

    /* await window.api.showChild(discogsResults); */
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
      /*   dispatch({
        type: 'albums-in-playlist',
        albumsInPlaylist: [...state.albumsInPlaylist, e.target.id]
      }); */
    }
  };

  const handleContextMenuOption = async (option, path, album) => {
    if (option[0] === 'search for cover') {
      const refAlbum = album
        .split(' ')
        .filter(
          (sl) =>
            !sl.startsWith('(') && !sl.endsWith(')') && !sl.startsWith('[') && !sl.endsWith(']')
        );
      handleCoverSearch({ path: path, album: refAlbum.join(' ') });
      /* setCoverSearch({ path: path, album: refAlbum.join(' ') }); */
    } else if (option[0] === 'add album to playlist') {
      handleAlbumToPlaylist(path);
    } else if (option[0] === 'open album folder') {
      await window.api.openAlbumFolder(path);
    }
  };

  const coversObserver = useRef();
  const lastCoverElement = useCallback(
    (node) => {
      if (coversLoading) return;
      if (coversObserver.current) coversObserver.current.disconnect();
      coversObserver.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreCovers) {
            /* console.log('entries[0]', entries[0].isIntersecting && hasMoreCovers); */
            dispatch({
              type: 'set-covers-pagenumber',
              coversPageNumber: coversPageNumber + 1
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
    console.log('co: ', coversObserver.current);
  }, [coversObserver]);

  const handleContextMenu = async (e) => {
    e.preventDefault();
    const pathToAlbum = e.currentTarget.getAttribute('fullpath');
    const album = e.currentTarget.getAttribute('album');
    /* console.log('--->', album, pathToAlbum); */
    /* console.log(pathToAlbum, album); */
    await window.api.showAlbumCoverMenu();
    await window.api.onAlbumCoverMenu((e) => handleContextMenuOption(e, pathToAlbum, album));
  };

  return (
    <section className="albums-coverview">
      <ul className="albums-coverview--albums">
        {covers.length > 0 &&
          covers.map((cover, idx) => {
            return (
              <li key={uuidv4()} ref={covers.length === idx + 1 ? lastCoverElement : null}>
                {cover.img && <img src={cover.img} alt="" />}
                {!cover.img && <img src={NoImage} alt="" />}
                {/* {cover.fullpath === coverUpdate.fullpath && <img src={coverUpdate.file} alt="" />} */}
                {/* {cover.fullpath === coverUpdate.path ? <img src={coverUpdate.file} alt="" /> : null} */}
                <div className="overlay">
                  <span /* onClick={handleAlbumToPlaylist} */ id={cover.fullpath}>
                    {cover.foldername}
                  </span>
                  <div
                    className="item-menu"
                    id={cover.fullpath}
                    fullpath={cover.fullpath}
                    album={cover.foldername}
                  >
                    <BsThreeDots
                      /* onContextMenu={handleContextMenu} */
                      onClick={handleContextMenu}
                      /*fromlisttype={type}*/
                      id={cover.fullpath}
                      fullpath={cover.fullpath}
                      album={cover.foldername}
                    />
                  </div>
                </div>
              </li>
            );
          })}

        {/* <li>
          <div className="albums-coverview--view-more" onClick={handleViewMoreCovers}>
            <p>View</p>
            <p>More</p>
            <p id="view-more-logo">&#8853;</p>
          </div>
        </li> */}
      </ul>
    </section>
  );
};

export default AlbumsCoverView;
