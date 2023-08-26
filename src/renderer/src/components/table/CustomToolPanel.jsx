import { useState } from 'react';

const CustomToolPanel = ({ onClick }) => {
  return (
    <div className="column-panel">
      <fieldset style={{ display: 'flex' }}>
        <div>
          <input type="checkbox" name="audiofile" id="audiofile" onClick={onClick} value={true} />
          <label htmlFor="">file</label>
        </div>
        <div>
          <input type="checkbox" name="year" id="year" onClick={onClick} value={true} />
          <label htmlFor="">year</label>
        </div>
        <div>
          <input type="checkbox" name="title" id="title" onClick={onClick} value={true} />
          <label htmlFor="">title</label>
        </div>
        <div>
          <input type="checkbox" name="artist" id="artist" onClick={onClick} value={true} />
          <label htmlFor="">artist</label>
        </div>
        <div>
          <input type="checkbox" name="album" id="album" onClick={onClick} value={true} />
          <label htmlFor="">album</label>
        </div>
        <div>
          <input type="checkbox" name="genre" id="genre" onClick={onClick} />
          <label htmlFor="">genre</label>
        </div>
      </fieldset>
    </div>
  );
};

export default CustomToolPanel;
