export default function Haversine (userLat, userLon, stationLat, stationLon, decimals) {
    if (decimals === undefined) {
        decimals = 2;
    }
    const precision = Math.pow(10,decimals);
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
    const distance = (Math.round((radius * partTwo * 0.621371) * precision)) / precision;
    return distance;
}