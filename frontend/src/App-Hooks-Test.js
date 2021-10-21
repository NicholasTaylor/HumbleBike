import React, { useState, useEffect } from 'react';
import GetStation from './components/GetStation';
import UpdateDistance from './components/UpdateDistance';
import Station from './components/Station';
import SortStations from './components/SortStations';
import Logo from './components/Logo'
import CustomFonts from './components/Fonts'

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

    const onError = ({error}) => {
        setError(error.message);
    };

    const endpointInfo = 'https://gbfs.citibikenyc.com/gbfs/en/station_information.json';
    const endpointStatus = 'https://gbfs.citibikenyc.com/gbfs/en/station_status.json';

    Promise.all([GetStation(endpointInfo),GetStation(endpointStatus)])
      .then((results) => {
        const allStationInfo = results[0].data.stations;
        const allStationStatus = results[1].data.stations;
        const payload = [];
        for (let info_idx in allStationInfo) {
          let station = allStationInfo[info_idx];
          let status;
          for (let status_idx in allStationStatus) {
            let tempStatus = allStationStatus[status_idx];
            if (info_idx === status_idx) {
              status = tempStatus;
              break;
            }
          }
          let output = {
            station_id: station.station_id,
            lat: station.lat,
            lon: station.lon,
            name: station.name,
            classic: (status.num_bikes_available - status.num_ebikes_available),
            electric: status.num_ebikes_available,
            docks: status.num_docks_available,
            isVisible: true,
            
          }
          payload.push(output);
        }
        return payload
      })
      .then((stationList) => {
        setStations(SortStations(stationList,false));
        return stationList;
      })
      .then((stationListSaved) => {
        if (location && stationListSaved && !(error)){
          setStations(SortStations(UpdateDistance(location.latitude, location.longitude, stationListSaved),true));
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
      <CustomFonts />
        <div id="container">
          <div
            id="content"
          >
            <Logo />
            { stations.map(station => <Station key={station.station_id} data={station} />) }
          </div>
        </div>
    </div>
  );
}
