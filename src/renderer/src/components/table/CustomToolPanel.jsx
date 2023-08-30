import { useState } from 'react';

const CustomToolPanel = ({ onChange, onClick }) => {
  return (
    <div className="column-panel">
      <fieldset style={{ display: 'flex', justifyContent: 'space-around' }}>
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
      </fieldset>
    </div>
  );
};

export default CustomToolPanel;
