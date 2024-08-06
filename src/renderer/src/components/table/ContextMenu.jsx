import React, { useState, useEffect } from 'react';

const CustomContextMenu = ({ x, y, menuItems, onClose }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: x,
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        boxShadow: '0px 0px 6px rgba(0,0,0,0.3)'
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {menuItems.map((item, index) => (
        <div
          key={index}
          style={{ padding: '8px 12px', cursor: 'pointer' }}
          onClick={() => {
            item.action();
            onClose();
          }}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
};

export default CustomContextMenu;
