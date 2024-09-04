<div
  key="loader"
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: `${estimatedSize}px`,
    height: `${estimatedSize}px`,
    transform: `translateY(${estimatedSize}px)`
  }}
>
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, ${estimatedSize}px)`,
      gap: `${gap}px`,
      justifyContent: 'center'
    }}
  >
    <div style={{ backgroundColor: 'red', width: '100px', height: '100px' }}>Loading ....</div>
  </div>
</div>;
