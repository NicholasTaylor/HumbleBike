import React, { useState, useEffect } from 'react';
import UpdateDistance from './components/UpdateDistance';

export default function AppHooksTest() {
  const [location, setLocation] = useState({});
  const [error, setError] = useState(null);
  const [stations, setStations] = useState([]);



  useEffect(() => {
    const onLocationChange = ({coords}) => {
      setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude
      });
    };

    const onError = (error) => {
        setError(error.message);
    };
    
    fetch('https://gbfs.citibikenyc.com/gbfs/en/station_information.json')
      .then((response) => response.json())
      .then((json) => {
        const allStations = json.data.stations;
        const payload = [];
        for (let station_idx in allStations) {
          let station = allStations[station_idx];
          let output = {
            station_id: station.station_id,
            lat: station.lat,
            lon: station.lon
          }
          payload.push(output);
        }
        return payload
      })
      .then((stationList) => {
        setStations(stationList);
        return stationList;
      })
      .then((stationListSaved) => {
        if (location && stationListSaved && !(error)){
          setStations(UpdateDistance(location.latitude, location.longitude, stationListSaved));
        }
      });
  
    const geo = navigator.geolocation;
    if (!geo) {
        setError('Location not available.');
        return;
    }
    const update = geo.watchPosition(onLocationChange, onError);
    return () => geo.clearWatch(update);
  },[location])

  return (
    <div>
      { location.latitude }<br/>
      { location.longitude }<br/>
      { error }<br></br>
      { stations.map(station => <div>{station.station_id} {station.dist ? '(' +station.dist +'mi.)' : ''}</div>) }
    </div>
  );
}
