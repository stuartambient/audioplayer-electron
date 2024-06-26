import loader from '../assets/loaders/rings.svg';

const StatsLoader = () => {
  return (
    <div
      style={{
        height: '50%',
        width: '50%',
        background: `url(${loader}) center / contain no-repeat`,
        margin: '0 auto'
      }}
    ></div>
  );
};

export default StatsLoader;
