import { endpointStatus } from "../constants/endpoints";
import FetchData from "./FetchData";
import SortStations from "./SortStations";
import UpdateDistance from "./UpdateDistance";

const updateStationDist = (stationList, location, error) => {
    if (location && stationList && !error) {
        return SortStations(
            UpdateDistance(location.latitude, location.longitude, stationList),
            true
        );
    } else {
        return SortStations(stationList, false);
    }
}

const UpdateStationStatus = (stationInfo) => {
    const fetchPromse = new Promise((resolve) => {
        resolve(FetchData(endpointStatus));
    })
    fetchPromse.then(
    (results) => {
        const stationMap = stationInfo;
        const allStationStatus = results[1].data.stations;
        const stationStatus = [];

        for (let status_idx = 0; status_idx < allStationStatus.length; status_idx++) {
                let station = allStationStatus[status_idx];
                let target = stationMap[station.station_id];
            if (target) {
                const statusData = {
                    classic:
                        station.num_bikes_available - station.num_ebikes_available,
                    electric: station.num_ebikes_available,
                    docks: station.num_docks_available,
                    isVisible: true,
                };
                Object.assign(target, statusData);
                stationStatus.push(target);
            }
        }
        return [updateStationDist(stationStatus), new Date().toLocaleString()];
    }
    );
};

export default UpdateStationStatus;