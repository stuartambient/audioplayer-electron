import { useState } from 'react';
import '../style/CoverSearch.css';

const CoverSearch = () => {
  const [missingCovers, setMissingCovers] = useState([]);
  const [searchItem, setSearchItem] = useState('');

  const handleCoversUpdate = async (e) => {
    if (e.target.id === 'updatecovers') {
      const covers = await window.api.updateCovers();
    }
    if (e.target.id === 'missingcovers') {
      const missingcovers = await window.api.missingCovers();
      /*  setMissingCovers(missingcovers); */
      setMissingCovers(missingcovers);
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
        <span className="coverlinks" id="missingcovers" onClick={handleCoversUpdate}>
          Missing Covers
        </span>
      </nav>
      {missingCovers && (
        <ul className="missingcovers">
          {missingCovers.map((c, i) => {
            return (
              <li key={i} id={c.coversearchname} onClick={handleItem}>
                {c.coversearchname}
              </li>
            );
          })}
        </ul>
      )}
      {searchItem !== '' && <p className="searchitem">{searchItem}</p>}
    </div>
  );
};

export default CoverSearch;
