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

import '../style/MainNav.css';

const MainNav = ({ onClick, home, update, player, minimalmode }) => {
  return (
    <nav className={!minimalmode ? 'main-nav' : 'main-nav main-nav--minimal'}>
      {!minimalmode && (
        <>
          <ul className="main-nav--left" style={{ justifySelf: 'start' }}>
            <li onClick={onClick} id="menu">
              <AiOutlineMenu />
            </li>
          </ul>
          <ul className="main-nav--center">
            <li onClick={onClick} id="home" className={home ? 'highlight' : ''}>
              <span>Home</span>
            </li>
            <li onClick={onClick} id="update" className={update ? 'highlight' : ''}>
              <span>Update</span>
            </li>
            <li onClick={onClick} id="player" className={player ? 'highlight' : ''}>
              <span>Player</span>
            </li>
            <li onClick={onClick} id="mini-mode" className="">
              <span>Miniplayer</span>
            </li>
          </ul>
          <ul className="main-nav--right">
            <li onClick={onClick} id="minimize">
              <AiOutlineMinus />
            </li>
            <li onClick={onClick} id="maximize">
              <AiOutlineFullscreen />
            </li>
            <li onClick={onClick} id="close">
              <AiOutlineClose />
            </li>
          </ul>
        </>
      )}

      {minimalmode && (
        <>
          <ul className="main-nav--left">
            <li onClick={onClick} id="mini-mode" className="mini">
              <CgMiniPlayer />
            </li>
            <li onClick={onClick} id="mini-mode-playlist" className="">
              <FaListUl />
            </li>
            <li onClick={onClick} id="close">
              <AiOutlineClose />
            </li>
          </ul>
          <div
            className="minimode-info"
            id="minimodeinfo"
            onClick={onClick}
            style={{ gridRow: '1 / 2', gridColumn: '5 / 6' }}
          >
            <AiOutlineInfoCircle />
          </div>
        </>
      )}
    </nav>
  );
};

export default MainNav;
