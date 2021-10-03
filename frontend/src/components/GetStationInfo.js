import  { useState, useEffect } from 'react';
const haversine = (userLat, userLon, stationLat, stationLon) => {
  const degToRad = (numDegree) => {
    return numDegree * Math.PI / 180;
  }

  const radius = 6371;
  const userLatRad = degToRad(userLat);
  const stationLatRad = degToRad(stationLat);
  const deltaLatRad = degToRad((userLat - stationLat));
  const deltaLonRad = degToRad((userLon - stationLon));
  const partOne = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) + Math.sin(deltaLonRad / 2) * Math.sin(deltaLonRad / 2) * Math.cos(userLatRad) * Math.cos(stationLatRad);
  const partTwo = Math.atan2(Math.sqrt(partOne), Math.sqrt(1 - partOne)) * 2;
  const distance = (Math.round((radius * partTwo * 0.621371) * 100)) / 100;
  return distance;
}

export default function GetStationInfo (latitude, longitude, error) {
  const [stations, setStations] = useState([]);
  useEffect(() => {
    fetch('https://gbfs.citibikenyc.com/gbfs/en/station_information.json')
      .then((response) => response.json())
      .then((json) => {
        const allStations = json.data.stations;
        const payload = [];
        for (let station_idx in allStations) {
          let station = allStations[station_idx];
          let output = {
            station_id: station.station_id,
            dist: haversine(latitude, longitude, station.lat, station.lon)
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