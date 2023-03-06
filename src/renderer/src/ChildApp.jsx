import { useState } from 'react';

const ChildApp = () => {
  const [str, setStr] = useState('12345');
  return <p>{str}</p>;
};

export default ChildApp;
