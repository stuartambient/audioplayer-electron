import { useState } from 'react';
import '../style/CoverSearch.css';

const CoverSearch = () => {
  /*  const [missingCovers, setMissingCovers] = useState([]); */
  const [searchItem, setSearchItem] = useState('');

  const handleItem = async (e) => {
    setSearchItem(e.target.id);
  };

  return (
    <div className="coversearch">
      <nav className="coversmenu">
        {/*      <span className="coverlinks" id="updatecovers" onClick={handleCoversUpdate}>
          Update Covers
        </span> */}
      </nav>
      {searchItem !== '' && <p className="searchitem">{searchItem}</p>}
    </div>
  );
};

export default CoverSearch;
