import  { useState, useEffect } from 'react';
export default function GetStationInfo () {
  const [stations, setStations] = useState([]);
  useEffect(() => {
    fetch('https://gbfs.citibikenyc.com/gbfs/en/station_information.json')
      .then((response) => response.json())
      .then((json) => {
        const allStations = json.data.stations;
        const payload = [];
        for (let station_idx in allStations) {
          let station = allStations[station_idx];
          console.log('lat:' +station.lat)
          let output = {
            station_id: station.station_id,
            lat: station.lat,
            lon: station.lon,
            dist: NaN
          }
          payload.push(output);
        }
        return payload
      })
      .then((stationList) => {
        setStations(stationList);
    })
  },[])
  return stations;
}