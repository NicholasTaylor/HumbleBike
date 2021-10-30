import Haversine from "./Haversine";

export default function UpdateDistance (latitude, longitude, stations) {
    console.log(`Fired. Lat: ${latitude}, Lon: ${longitude}`);
    const newStations = [];
    for (let station_idx in stations) {
        let station = stations[station_idx];
        let output = Object.assign(station,{dist:Haversine(latitude, longitude, station.lat, station.lon)})
        newStations.push(output);
      }
    return newStations;
}