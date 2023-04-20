import { useState } from 'react';
import '../style/CoverSearch.css';

const CoverSearch = () => {
  const [missingCovers, setMissingCovers] = useState([]);
  const [searchItem, setSearchItem] = useState('');

  const handleCoversUpdate = async (e) => {
    if (e.target.id === 'updatecovers') {
      const covers = await window.api.updateCovers();
      console.log('update covers: ', covers);
    }
  };

  const handleItem = async (e) => {
    setSearchItem(e.target.id);
  };

  return (
    <div className="coversearch">
      <nav className="coversmenu">
        <span className="coverlinks" id="updatecovers" onClick={handleCoversUpdate}>
          Update Covers
        </span>
      </nav>
      {searchItem !== '' && <p className="searchitem">{searchItem}</p>}
    </div>
  );
};

export default CoverSearch;
