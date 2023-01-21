import {
  AiOutlineMenu,
  AiOutlineHome,
  AiOutlineScan,
  AiOutlineMinus,
  AiOutlineFullscreen,
  AiOutlineClose,
  AiOutlineMobile
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
              <AiOutlineHome />
            </li>
            <li onClick={onClick} id="update" className={update ? 'highlight' : ''}>
              <AiOutlineScan />
            </li>
            <li onClick={onClick} id="player" className={player ? 'highlight' : ''}>
              <BsMusicPlayer />
            </li>
            <li onClick={onClick} id="mini-mode" className="">
              {/*  <AiOutlineMobile /> */}
              <CgMiniPlayer />
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
        <ul className="main-nav--left">
          <li onClick={onClick} id="mini-mode" className="">
            <CgMiniPlayer />
          </li>
          <li onClick={onClick} id="mini-mode-playlist" className="">
            <FaListUl />
          </li>
        </ul>
      )}
    </nav>
  );
};

export default MainNav;
