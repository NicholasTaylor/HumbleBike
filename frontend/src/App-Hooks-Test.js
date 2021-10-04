import React from 'react';
import GetLocation from './components/GetLocation';
import GetStationInfo from './components/GetStationInfo';

export default function AppHooksTest() {
  const {latitude, longitude, error} = GetLocation();
  const stations = GetStationInfo(latitude, longitude, error);
  return (
    <div>
      { latitude }<br/>
      { longitude }<br/>
      { error }<br></br>
      { stations.map(station => <div>{station.station_id} ({station.dist} mi.)</div>) }
    </div>
  );
}
