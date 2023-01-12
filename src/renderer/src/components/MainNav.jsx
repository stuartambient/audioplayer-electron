import {
  AiOutlineMenu,
  AiOutlineHome,
  AiOutlineScan,
  AiOutlineMinus,
  AiOutlineFullscreen,
  AiOutlineClose
} from 'react-icons/ai';

import { BsMusicPlayer } from 'react-icons/bs';
import { CgMiniPlayer } from 'react-icons/cg';

import '../style/MainNav.css';

const MainNav = ({ onClick, home, update, player }) => {
  return (
    <nav className="main-nav">
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
        <li onClick={onClick} id="mini-mode" className="minimode">
          <CgMiniPlayer style={{ stroke: 'white' }} />
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
    </nav>
  );
};

export default MainNav;
