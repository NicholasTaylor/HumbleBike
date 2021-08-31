import {DATA_LOAD_SUCCESS, SEARCH_STATIONS, FILTER_ELEC, FILTER_DOCK, FILTER_ELEC_FREE} from '../constants/action-types';

const stateInit = {
	stations: [],
	updated: '',
	hasLocation: false,
	searchQuery: '',
	search: 'searchOff',
	filterElec: 'filterElecOff', 
	filterElecFree: 'filterElecFreeOff',
	filterDock: 'filterDockOff' 
};

function rootReducer(state = stateInit, action){

	const haversine = (userLat, userLon, stationLat, stationLon) => {
		const degToRad = (numDegree) => {
			return numDegree * Math.PI / 180;
		}

		const radius = 6371;
		const userLatRad = degToRad(userLat);
		const stationLatRad = degToRad(stationLat);
		const deltaLatRad = degToRad((userLat - stationLat));
		const deltaLonRad = degToRad((userLon - stationLon));
		const partOne = Math.sin(deltaLatRad/2) * Math.sin(deltaLatRad/2) + Math.sin(deltaLonRad/2) * Math.sin(deltaLonRad/2) * Math.cos(userLatRad) * Math.cos(stationLatRad);
		const partTwo = Math.atan2(Math.sqrt(partOne), Math.sqrt(1-partOne)) * 2;
		const distance = (Math.round((radius * partTwo * 0.621371) * 100))/100;
		return distance;
	}

	if (action.type === DATA_LOAD_SUCCESS){
		const idList = [];
		for (let i = 0; i < state.stations.length; i++){
			const stationOld = state.stations[i];
			idList.push(stationOld.station_id);
		}
		const processedData = [];
		const loc = action.payload.location;
		const hasLocation = loc.isLocation ? true : false;
		for (let station in action.payload.stations.data.stations){
			const currentStation = action.payload.stations.data.stations[station];
			for (let info in action.payload.info.data.stations){
				const currentInfo = action.payload.info.data.stations[info];
				if (currentStation.station_id === currentInfo.station_id){
					const tempObj = idList.includes(currentStation.station_id) ? { ...state.stations[idList.indexOf(currentStation.station_id)] } : {};
					tempObj.station_id = currentStation.station_id;
					tempObj.classic = currentStation.num_bikes_available - currentStation.num_ebikes_available;
					tempObj.docks = currentStation.num_docks_available;
					tempObj.electric = currentStation.num_ebikes_available;
					tempObj.name = currentInfo.name;
					if (hasLocation){
						tempObj.dist = ' (' +haversine(loc.lat, loc.lon, currentInfo.lat, currentInfo.lon) +' mi.)';
					}
					processedData.push(tempObj);
					break;
				}
			}
		}
		const processedDataSorted = hasLocation ? processedData.sort((a,b) => a.dist > b.dist ? 1 : -1) : processedData.sort((a,b) => a.name > b.name ? 1 : -1);
		const updated = new Date();
		const convertTwoDigits = (num) => {
			return num >= 10 ? num : '0' + num;
		}
		return Object.assign({}, state, {
			stations: processedDataSorted,
			updated: convertTwoDigits((updated.getMonth() + 1)) +'/' + convertTwoDigits(updated.getDate()) +'/' +(updated.getYear() + 1900) +' ' +convertTwoDigits(updated.getHours()) +':' +convertTwoDigits(updated.getMinutes()) +':' +convertTwoDigits(updated.getSeconds()),
			hasLocation: hasLocation,
			search: state.search
		});
	}
	if (action.type === SEARCH_STATIONS){
		const searchQuery = action.payload.searchQuery;
		const stationsSearch = Object.assign([],state.stations);
		if (searchQuery.length > 0){
			for (let i = 0; i < stationsSearch.length; i++){
				const currentStation = stationsSearch[i]
				if (currentStation.name.toLowerCase().includes(searchQuery.toLowerCase())){
					currentStation.isVisible = true
				} else {
					currentStation.isVisible = false
				}
			}
			return Object.assign({},state,{
				searchQuery: searchQuery,
				stations: stationsSearch,
				search: 'searchOn'
			})
		} else {
			for (let i = 0; i < stationsSearch.length; i++){
				const currentStation = stationsSearch[i]
				currentStation.isVisible = false
				}
			return Object.assign({},state,{
				searchQuery: searchQuery,
				stations: stationsSearch,
				search: 'searchOff'
			})
		}
	}

	if (action.type === FILTER_ELEC){
		const tempObj = {...state};
		tempObj.filterElec = state.filterElec === 'filterElecOff' ? 'filterElecOn' : 'filterElecOff';
		return Object.assign({},tempObj)
	}

	if (action.type === FILTER_ELEC_FREE){
		const tempObj = {...state};
		tempObj.filterElecFree = state.filterElecFree === 'filterElecFreeOff' ? 'filterElecFreeOn' : 'filterElecFreeOff';
		return Object.assign({},tempObj)
	}

	if (action.type === FILTER_DOCK){
		const tempObj = {...state};
		tempObj.filterDock = state.filterDock === 'filterDockOff' ? 'filterDockOn' : 'filterDockOff';
		return Object.assign({},tempObj)
	}
	return state;
}

export default rootReducer;