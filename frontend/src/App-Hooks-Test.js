import React, { useState, useEffect } from 'react';
import GetStation from './components/GetStation';
import UpdateDistance from './components/UpdateDistance';
import Station from './components/Station';
import SortStations from './components/SortStations';
import Logo from './components/Logo';
import CustomFonts from './components/Fonts';
import Haversine from './components/Haversine';

export default function AppHooksTest() {
  const [location, setLocation] = useState({});
  const [error, setError] = useState(null);
  const [stations, setStations] = useState([]);
  const [timedRefresh, setTimedRefresh] = useState(0);



  useEffect(() => {
    const autoRefresh = setInterval(() => {
      console.log('Refreshing');
      setTimedRefresh(timedRefresh + 1);
    },10000);
    const onLocationChange = ({coords}) => {
      const minDist = 0.0075;
      const locDelta = Haversine(location.latitude, location.longitude, coords.latitude, coords.longitude,5);
      console.log(`locDelta = ${locDelta}\nminDist = ${minDist}\nerror = ${error}\n`);
      if (locDelta > minDist || error || !(locDelta)){
        console.log('Firing.');
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude
        });
        clearInterval(autoRefresh);
      }
    };

    const onError = (error) => {
        setError(error.message);
    };

    const endpointInfo = 'https://gbfs.citibikenyc.com/gbfs/en/station_information.json';
    const endpointStatus = 'https://gbfs.citibikenyc.com/gbfs/en/station_status.json';

    Promise.all([GetStation(endpointInfo),GetStation(endpointStatus)])
      .then((results) => {
        const allStationInfo = results[0].data.stations;
        const allStationStatus = results[1].data.stations;
        const payload = [];
        const stationMap = {};
        for (let info_idx = 0; info_idx < allStationInfo.length; info_idx++) {
          let station = allStationInfo[info_idx];
          stationMap[station.station_id] = {
            station_id: station.station_id,
            lat: station.lat,
            lon: station.lon,
            name: station.name,
            isVisible: true,
          };
        }
        for (let status_idx = 0; status_idx < allStationStatus.length; status_idx++) {
          let station = allStationStatus[status_idx];
          let target = stationMap[station.station_id];
          if (target) {
            const statusData = {
              classic: (station.num_bikes_available - station.num_ebikes_available),
              electric: station.num_ebikes_available,
              docks: station.num_docks_available,
            };
            Object.assign(target,statusData);
            payload.push(target);
          }
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
  },[location,error, timedRefresh])

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
