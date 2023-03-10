/* SELECT foldername FROM albums ORDER BY datecreated DESC LIMIT 10 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { Buffer } from 'buffer';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useLast10AlbumsStat, useLast100TracksStat, useAllAlbumsCovers } from '../hooks/useDb';
import { BsThreeDots } from 'react-icons/bs';
import NoImage from '../assets/noimage.jpg';
import ViewMore from '../assets/view-more-alt.jpg';
import AppState from '../hooks/AppState';

const RecentAdditions = ({ state, dispatch, covers, coversPageNumber, coversSearchTerm }) => {
  const { last10Albums } = useLast10AlbumsStat();
  const { last100Tracks } = useLast100TracksStat();
  const [viewMore, setViewMore] = useState(false);
  const [coverSearch, setCoverSearch] = useState({ path: '', album: '' });

  const { coversLoading, hasMoreCovers, coversError } = useAllAlbumsCovers(
    coversPageNumber,
    dispatch,
    coversSearchTerm
  );

  /*   const coversObserver = useRef();

  const lastCoverElement = useCallback(
    (node) => {
      if (coversLoading) return;
      if (coversObserver.current) coversObserver.current.disconnect();
      coversObserver.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMoreCovers) {
            setCoversPageNumber(coversPageNumber + 1);
          }
        },
        {
          root: document.querySelector('.recent-additions--albums'),
          rootMargin: '0px',
          threshold: 1.0
        }
      );
      if (node) coversObserver.current.observe(node);
    },
    [coversLoading, hasMoreCovers]
  ); */

  /* GET https://api.discogs.com/database/search?release_title=nevermind&artist=nirvana&per_page=3&page=1 */

  const compareStrs = (str1, str2) => {
    let correct = { total: str2.split(' ').length, failed: 0 };
    for (const a of str1) {
      if (!str2.includes(a)) {
        correct.failed += 1;
      }
    }
    const percentage = 100 - (correct.failed / correct.total) * 100;
    return percentage;
  };

  useEffect(() => {
    const mbrainzSearch = async () => {
      let validResults = { path: coverSearch.path, results: [] };
      const res = await axios
        /* .get(`http://musicbrainz.org/ws/2/release-group/?query=${coverSearch.album}&limit=1`) */
        .get(
          `https://api.discogs.com/database/search?q=${coverSearch.album}&token=${
            import.meta.env.RENDERER_VITE_DISCOGS_KEY
          }`
        )

        .then((response) => {
          response.data.results.forEach((r) => {
            let tmp = coverSearch.album.split(' ').filter((f) => f !== '-');
            let compare = compareStrs(tmp, r.title);
            if (compare > 75) validResults.results.push(r);
          });
          window.api.showChild(validResults);
        })

        //})
        .catch((err) => {
          console.log(err);
        });
    };
    if (coverSearch.path !== '' && coverSearch.album !== '') {
      mbrainzSearch();
    }
  }, [coverSearch]);

  const handleAlbumToPlaylist = async (e) => {
    e.preventDefault();
    /* if (state.albumsInPlaylist.includes(e.target.id)) return; */
    /* console.log(e.target.id); */
    const albumTracks = await window.api.getAlbumTracks(e.target.id);
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
    /* console.log('context menu option: ', option, path, album); */
    if (option[0] === 'search for cover') {
      const refAlbum = album
        .split(' ')
        .filter(
          (sl) =>
            !sl.startsWith('(') && !sl.endsWith(')') && !sl.startsWith('[') && !sl.endsWith(']')
        );
      setCoverSearch({ path: path, album: refAlbum.join(' ') });
    }
  };

  const handleViewMoreCovers = () => {
    if (!viewMore) setViewMore(true);
    if (!coversPageNumber)
      return dispatch({
        type: 'set-covers-pagenumber',
        coversPageNumber: 1
      });
    dispatch({
      type: 'set-covers-pagenumber',
      coversPageNumber: coversPageNumber + 1
    });
  };

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
    <section className="recent-additions">
      <ul className="recent-additions--albums">
        {last10Albums.map((album, idx) => {
          return (
            <li
              key={idx}
              /* ref={covers.length === index + 1 ? lastCoverElement : null} */
            >
              {album.img && <img src={album.img} alt="" />}
              {!album.img && <img src={NoImage} alt="" />}
              <div className="overlay">
                <span onClick={handleAlbumToPlaylist} id={album.fullpath}>
                  {album.foldername}
                </span>
                <div
                  className="item-menu"
                  id={album.fullpath}
                  fullpath={album.fullpath}
                  album={album.foldername}
                >
                  <BsThreeDots
                    onContextMenu={handleContextMenu}
                    /* romlisttype={type} */
                    id={album.fullpath}
                    fullpath={album.fullpath}
                    album={album.foldername}
                    /* fullpath={fullpath} */
                  />
                </div>
              </div>
            </li>
          );
        })}
        {covers.length > 0 &&
          covers.map((cover, idx) => {
            return (
              <li key={idx}>
                {cover.img && <img src={cover.img} alt="" />}
                {!cover.img && <img src={NoImage} alt="" />}
                <div className="overlay">
                  <span onClick={handleAlbumToPlaylist} id={cover.fullpath}>
                    {cover.foldername}
                  </span>
                  <div
                    className="item-menu"
                    id={cover.fullpath}
                    fullpath={cover.fullpath}
                    album={cover.foldername}
                  >
                    <BsThreeDots
                      onContextMenu={handleContextMenu}
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

        <li>
          <div className="recent-additions--view-more" onClick={handleViewMoreCovers}>
            <p>View</p>
            <p>More</p>
            <p id="view-more-logo">&#8853;</p>
          </div>
        </li>
      </ul>
    </section>
  );
};

export default RecentAdditions;
