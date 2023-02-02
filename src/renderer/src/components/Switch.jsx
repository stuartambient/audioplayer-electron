import { useRef, useState } from 'react';
import '../style/switch.css';

const Switch = ({ type, setType, className }) => {
  const switchRef = useRef(null);

  const handleSwitch = (e) => {
    const switchAttr = switchRef.current.getAttribute('data-type');
    switch (switchAttr) {
      case 'files':
        /* resetState(); */
        switchRef.current.setAttribute('data-type', 'albums');
        setType('albums');
        break;
      case 'albums':
        /* resetState(); */
        switchRef.current.setAttribute('data-type', 'files');
        setType('files');
        break;
      default:
        return;
    }
  };

  const handleSwitchClassNames = () => {
    switch (type) {
      case 'files':
        return 'switch left';
      case 'albums':
        return 'switch right';
      case 'playlist':
        return 'switch playlist';
    }
  };
  return (
    <div className={className}>
      <div
        className={type === 'files' ? 'switch left' : 'switch right'}
        id="files"
        data-type="files"
        onClick={handleSwitch}
        ref={switchRef}
      >
        <span className="info">{type}</span>
      </div>
      {/*  <div className="switch" id="albums" onClick={handleSwitch}>
        <span className="info"></span>
      </div> */}
    </div>
  );
};

export default Switch;
