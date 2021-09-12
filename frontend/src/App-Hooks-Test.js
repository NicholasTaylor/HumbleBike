import React, { useState, useEffect } from 'react';
import GetBikeData from './components/GetBikeData';

export default function AppHooksTest() {
  const [location, setLocation] = useState({});
  useEffect(() => {
    const newLoc = GetBikeData();
    setLocation(newLoc);
  });
  return (
    <div>
      {console.log(location)}
    </div>
  );
}
