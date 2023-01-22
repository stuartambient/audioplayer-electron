{true ? (
<div className="slider-group">    
<>
<div className="volume-outline" onMouseMove={handleVolume} ref={volumebarOutline}>
  <div className="volumebar" ref={volumeslider}></div>
</div>
</>
<>
<div className="seekbar-outline" ref={seekbarOutline} onClick={handleSeekTime}>
  <div className="seekbar" style={{ width: progbarInc ? `${progbarInc}px` : null }}></div>
</div>
</>
</div>):
<>
(<div className="volume-outline" onMouseMove={handleVolume} ref={volumebarOutline}>
  <div className="volumebar" ref={volumeslider}></div>
</div>
<div className="seekbar-outline" ref={seekbarOutline} onClick={handleSeekTime}>
  <div className="seekbar" style={{ width: progbarInc ? `${progbarInc}px` : null }}></div>
</div>)}