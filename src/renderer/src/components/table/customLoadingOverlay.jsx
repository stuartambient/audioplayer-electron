import loader from '../../assets/loaders/rings.svg';

export default (props) => {
  return (
    <div className="overlay" role="presentation">
      <div
        /* role="presentation" */
        style={{
          height: 100,
          width: 100,
          background: `url(${loader}) center / contain no-repeat`,
          margin: '0 auto'
        }}
      ></div>
      <div aria-live="polite" aria-atomic="true">
        Loading...
      </div>
    </div>
  );
};
