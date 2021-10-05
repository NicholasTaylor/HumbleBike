export default function UpdateDistance (latitude, longitude, stations) {
    console.log('Fired.')
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
    const newStations = [];
    for (let station_idx in stations) {
        let station = stations[station_idx];
        let output = {
          station_id: station.station_id,
          lat: station.lat,
          lon: station.lon,
          dist: haversine(latitude, longitude, station.lat, station.lon)
        }
        newStations.push(output);
      }
    return newStations;
}