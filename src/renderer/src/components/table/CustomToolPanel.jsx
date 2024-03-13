import { useState } from 'react';
import EditForm from './EditForm';
import './styles/CustomToolPanel.css';

const CustomToolPanel = ({ onChange, onClick, onUpdate, nodesSelected }) => {
  const [onForm, setOnForm] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(true);

  const togglePanelVisibility = () => {
    setIsPanelVisible(!isPanelVisible);
  };

  return (
    <>
      <button className="hamburger-btn" onClick={togglePanelVisibility}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div className={`column-panel ${isPanelVisible ? '' : 'hidden'}`}>
        <fieldset /* style={{ display: 'flex' }} */>
          <div>
            <input
              type="checkbox"
              name="audiofile"
              id="audiofile"
              onChange={onChange}
              defaultChecked
              value={true}
            />
            <label htmlFor="">file</label>
          </div>
          <div>
            <input
              type="checkbox"
              name="year"
              id="year"
              defaultChecked
              onChange={onChange}
              value={true}
            />
            <label htmlFor="">year</label>
          </div>
          <div>
            <input
              type="checkbox"
              name="title"
              id="title"
              defaultChecked
              onChange={onChange}
              value={true}
            />
            <label htmlFor="">title</label>
          </div>
          <div>
            <input
              type="checkbox"
              name="artist"
              id="artist"
              defaultChecked
              onChange={onChange}
              value={true}
            />
            <label htmlFor="">artist</label>
          </div>
          <div>
            <input
              type="checkbox"
              name="album"
              id="album"
              defaultChecked
              onChange={onChange}
              value={true}
            />
            <label htmlFor="">album</label>
          </div>
          <div>
            <input
              type="checkbox"
              name="genre"
              id="genre"
              defaultChecked
              onChange={onChange}
              value={true}
            />
            <label htmlFor="">genre</label>
          </div>
          <div>
            <button id="auto-size-all" className="auto-size-all" onClick={onClick}>
              Auto Size All
            </button>
          </div>
          <div>
            <button id="reset-window" className="reset-window" onClick={onClick}>
              Reset Window
            </button>
          </div>
          <div>
            <button id="deselect-all" className="deselect-all" onClick={onClick}>
              Deselect All
            </button>
          </div>
          <div>
            <button id="save-all" className="save-all" onClick={onClick}>
              Save all
            </button>
            <button id="cancel-all" className="cancel-all" onClick={onClick}>
              Cancel all
            </button>
          </div>
          <div>
            <button id="undo-last" className="undo-last" onClick={onClick}>
              Undo
            </button>
            <button id="redo-last" className="redo-last" onClick={onClick}>
              Redo
            </button>
          </div>
        </fieldset>
        {nodesSelected.length > 0 && <EditForm onUpdate={onUpdate} nodesSelected={nodesSelected} />}
      </div>
    </>
  );
};

export default CustomToolPanel;
