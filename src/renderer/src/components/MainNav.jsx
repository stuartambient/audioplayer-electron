import { useAudioPlayer } from '../AudioPlayerContext';
import { useEffect } from 'react';
import {
  AiOutlineMenu,
  AiOutlineHome,
  AiOutlineScan,
  AiOutlineMinus,
  AiOutlineFullscreen,
  AiOutlineClose,
  AiOutlineMobile,
  AiOutlineInfoCircle
} from 'react-icons/ai';
import { FaListUl } from 'react-icons/fa';
import { BsMusicPlayer } from 'react-icons/bs';
import { CgMiniPlayer } from 'react-icons/cg';
import { VscChromeMaximize, VscChromeMinimize, VscChromeClose } from 'react-icons/vsc';

import '../style/MainNav.css';

const MainNav = ({ onClick }) => {
  const { state, dispatch } = useAudioPlayer();
  const hamburgerMenu = [
    'update-all',
    'schedule-updates',
    'update-files',
    'update-folders',
    'update-covers',
    'update-meta'
  ];

  useEffect(() => {
    const handleHamburger = (value) => {
      console.log('hamburger: ', value);
    };
    window.api.onHamburgerMenuCommand(handleHamburger);
    return () => {
      window.api.off('hamburger-menu-command', handleHamburger);
    };
  }, []);
  return (
    <nav className={!state.minimalmode ? 'main-nav' : 'main-nav main-nav--minimal'}>
      {!state.minimalmode && (
        <>
          <ul className="main-nav--left" style={{ justifySelf: 'start' }}>
            <li onClick={onClick} id="menu">
              <AiOutlineMenu />
            </li>
          </ul>
          <ul className="main-nav--center">
            {/*  <li onClick={onClick} id="home" className={state.home ? 'highlight' : ''}>
              <span>Home</span>
            </li> */}
            <li onClick={onClick} id="update" className={state.update ? 'highlight' : ''}>
              <span>Update</span>
            </li>
            <li onClick={onClick} id="player" className={state.player ? 'highlight' : ''}>
              <span>Player</span>
            </li>
            <li onClick={onClick} id="playerplaylist" className={state.player ? 'highlight' : ''}>
              <span>Lists</span>
            </li>
            <li onClick={onClick} id="mini-mode" className="endline">
              <span>Miniplayer</span>
            </li>
            <li onClick={onClick} id="albums" className={state.home ? 'highlight' : ''}>
              <span>Covers</span>
            </li>
            <li onClick={onClick} id="tag-editor" className={state.tagEditor ? 'highlight' : ''}>
              <span>Tags</span>
            </li>
            {/*  <li onClick={onClick} id="playlists" className="endline">
              <span>Playlists</span>
            </li> */}
          </ul>
          <ul className="main-nav--right">
            <li onClick={onClick} id="minimize">
              <VscChromeMinimize />
            </li>
            <li onClick={onClick} id="maximize">
              <VscChromeMaximize />
            </li>
            <li onClick={onClick} id="close">
              <VscChromeClose />
            </li>
          </ul>
        </>
      )}

      {state.minimalmode && (
        <>
          <ul className="main-nav--left-minimal">
            <li onClick={onClick} id="mini-mode" className="mini">
              <CgMiniPlayer />
            </li>
            <li onClick={onClick} id="mini-mode-playlist" className="">
              <FaListUl />
            </li>
          </ul>
          <ul className="main-nav--center-minimal">
            <li
              className="minimode-info"
              id="minimodeinfo"
              onClick={onClick}
              style={{ gridRow: '1 / 2', gridColumn: '5 / 6' }}
            >
              <AiOutlineInfoCircle />
            </li>
          </ul>
          <ul className="main-nav--right-minimal">
            {/*  <li onClick={onClick} id="maximize">
              <AiOutlineFullscreen />
            </li> */}
            {/* <li onClick={onClick} id="close">
              <AiOutlineClose />
            </li> */}
            <li onClick={onClick} id="minimize">
              <VscChromeMinimize />
            </li>
            <li onClick={onClick} id="maximize">
              <VscChromeMaximize />
            </li>
            <li onClick={onClick} id="close">
              <VscChromeClose />
            </li>
          </ul>
        </>
      )}
    </nav>
  );
};

export default MainNav;
