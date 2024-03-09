import { useState } from 'react';
import EditForm from './EditForm';

const CustomToolPanel = ({ onChange, onClick, nodesSelected }) => {
  const [onForm, setOnForm] = useState(false);
  return (
    <div className="column-panel">
      <fieldset style={{ display: 'flex' /* , justifyContent: 'space-around' */ }}>
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
          <button id="auto-size-all" onClick={onClick}>
            Auto Size All
          </button>
        </div>
        <div>
          <button id="reset-window" onClick={onClick}>
            Reset Window
          </button>
        </div>
        <div>
          <button id="deselect-all" onClick={onClick}>
            Deselect All
          </button>
        </div>
        <div>
          <button id="selected-nodes" onClick={onClick}>
            Selected Nodes
          </button>
        </div>
        <div>
          <button id="save-all" onClick={onClick}>
            Save all
          </button>
          <button id="cancel-all" onClick={onClick}>
            Cancel all
          </button>
        </div>
        <div>
          <button id="undo-last" onClick={onClick}>
            Undo
          </button>
          <button id="redo-last" onClick={onClick}>
            Redo
          </button>
        </div>
      </fieldset>
      {nodesSelected.length > 0 && (
        <EditForm onUpdate={(e) => console.log('updated')} nodesSelected={nodesSelected} />
      )}
    </div>
  );
};

export default CustomToolPanel;
