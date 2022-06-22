import { endpointInfo } from "../constants/endpoints";
import FetchData from "./FetchData";

const GetStationInfo = (stationInfo) => {
    if (Object.keys(stationInfo).length === 0) {
        return FetchData(endpointInfo)
            .then((response) => {
                const allStationInfo = response.data.stations;
                const stationMap = {};
                for (let info_idx = 0; info_idx < allStationInfo.length; info_idx++) {
                    let station = allStationInfo[info_idx];
                    stationMap[station.station_id] = {
                        station_id: station.station_id,
                        lat: station.lat,
                        lon: station.lon,
                        name: station.name,
                    };
                }
                return stationMap;
            });        
    }
    return stationInfo;
}

export default GetStationInfo;