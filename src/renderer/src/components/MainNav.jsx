import { useAudioPlayer } from '../AudioPlayerContext';
import { useEffect, useState } from 'react';
import StatusLoader from './table/StatusLoader';
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
  const [updateOption, setUpdateOption] = useState(null);
  const [updateResults, setUpdateResults] = useState(null);

  useEffect(() => {
    const handleUpdate = (type, result) => {
      console.log('type: ', type, 'result: ', result);
      setUpdateResults({ type, result });
      setUpdateOption(null);
    };

    window.api.onUpdateComplete(handleUpdate);
    return () => {
      window.api.off('update-complete', handleUpdate);
    };
  }, []);

  useEffect(() => {
    const runUpdates = () => {
      console.log('update option: ', updateOption);
      switch (updateOption) {
        case 'update-folders': {
          window.api.updateFolders();
          break;
        }
        case 'update-files': {
          window.api.updateFiles();
          break;
        }
        case 'update-covers': {
          window.api.updateCovers();
          break;
        }
        case 'update-meta': {
          window.api.updateMeta();
          break;
        }
        default:
          return;
      }
    };
    if (updateOption) runUpdates();
  }, [updateOption]);

  useEffect(() => {
    const handleUpdateOption = (option) => {
      setUpdateOption(option);
    };
    window.api.onHamburgerMenuCommand(handleUpdateOption);
    return () => {
      window.api.off('hamburger-menu-command', handleUpdateOption);
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
            {updateOption && (
              <li>
                <StatusLoader config="status-loader nav" />
              </li>
            )}
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
