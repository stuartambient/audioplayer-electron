import { useRef, useState } from "react";
import "../style/switch.css";

const Switch = ({ type, setType }) => {
  const switchRef = useRef(null);

  const handleSwitch = e => {
    const switchAttr = switchRef.current.getAttribute("data-type");
    switch (switchAttr) {
      case "files":
        /* resetState(); */
        switchRef.current.setAttribute("data-type", "albums");
        setType("albums");
        break;
      case "albums":
        /* resetState(); */
        switchRef.current.setAttribute("data-type", "files");
        setType("files");
        break;
      default:
        return;
    }
  };

  return (
    <div className="switch-container">
      <div
        className={type === "files" ? "switch left" : "switch right"}
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
