import '../style/Home.css';

const Home = () => {
  const handlePopup = async () => {
    const callMain = window.api.openChild();
    if (callMain) console.log(callMain);
  };
  return (
    <div className="home-container" style={{ color: 'white', fontSize: '2.5rem' }}>
      <>
        <div className="home-card">
          <div id="popup" onClick={handlePopup}>
            Popup
          </div>
        </div>
        {/*    <div className="home-card">Home 2</div>
        <div className="home-card">Home 2</div>
        <div className="home-card">Home 2</div>
        <div className="home-card">Home 2</div>
        <div className="home-card">Home 2</div>
        <div className="home-card">Home 2</div>
        <div className="home-card">Home 2</div>
        <div className="home-card">Home 2</div> */}
      </>
    </div>
  );
};

export default Home;
