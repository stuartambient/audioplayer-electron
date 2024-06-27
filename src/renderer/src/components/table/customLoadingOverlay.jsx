import React from 'react';
import './styles/CustomLoadingOverlay.css';

export default (props) => {
  return (
    <div className="table-overlay" role="presentation">
      {/* <div
        style={{
          height: 100,
          width: 100,
          background: `url(${loader}) center / contain no-repeat`,
          margin: '0 auto'
        }}
      ></div> */}
      {/* <div aria-live="polite" aria-atomic="true">
        Loading...
      </div> */}
    </div>
  );
};

/* export default (props) => {
  console.log(props);
  return <div className="custom-overlay-loader" role="presentation"></div>;
}; */
