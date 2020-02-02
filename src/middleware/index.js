import {GET_LOCATION, UPDATE_LOCATION, DATA_LOAD_SUCCESS, REQUEST_DATA_LOAD} from '../constants/action-types.js';



/*const refreshedData = {
	location: {},
	stations: {},
	info: {}
}*/

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

export function getDistanceArr (userLat, userLon, inputArr) {
	console.log(JSON.stringify(inputArr));
	for (let i=0; i < inputArr.length; i++){
		const currentStation = inputArr[i];
		console.log(currentStation.lat + ', ' +currentStation.lon);
	}
}

/*
const combineData = (input) => {
	const output = new Array;
	const rawData = input[input.length - 1];
	const stationsList = rawData.stations.data.stations;
	const infoList = rawData.info.data.stations;
	for (station in stationsList){
		const stationIn = stationsList[station];
		for (info in infoList){
			const infoIn = infoList[info];
			if (stationIn.station_id === infoIn.station_id && stationIn.is_installed === 1 && stationIn.is_renting === 1 && stationIn.is_returning === 1){
				const stationOut = {
					id: stationIn.station_id,
					name: infoIn.name,
					dist: haversine(rawData.location.lat, rawData.location.lon, infoIn.lat, infoIn.lon),
					classic: stationIn.num_bikes_available,
					electric: stationIn.num_ebikes_available,
					docks: stationIn.num_docks_available,
					isLocation: rawData.location.isLocation
				}
				output.push(stationOut);
				break;
			}
		}
	}
	return output;
}*/

export function getLocation({dispatch}){
	return function (next) {
		return function(action) {
			if (action.type === GET_LOCATION){
				navigator.geolocation.getCurrentPosition(
					(position)=>{
						return dispatch(
							{
								type: UPDATE_LOCATION,
								payload: {
									lat: position.coords.latitude,
									lon: position.coords.longitude,
									isLocation: true
								}
							}
						);
					},
					()=>{
						return dispatch(
							{
								type: UPDATE_LOCATION,
								payload: {
									lat: 0,
									lon: 0,
									isLocation: false
								}
							}
						);
					}
				)
				
			}
			return next(action);
		}
	}
}

const getLocation_v2 = (input) => {
	navigator.geolocation.getCurrentPosition(
		(position)=>{			
			input.location = {
				lat: position.coords.latitude,
				lon: position.coords.longitude,
				isLocation: true
			}
			return input;
		},
		()=>{
			return {
				lat: 0,
				lon: 0,
				isLocation: false
			}
		}
	)	
}



const getStation = (input) => {
	return fetch('https://gbfs.citibikenyc.com/gbfs/en/station_status.json')
		.then((response)=>response.json())
		.then((json)=>{
			Object.assign(input,json);
			return input;
		})
}

const getInfo = (input) => {
	return fetch('https://gbfs.citibikenyc.com/gbfs/en/station_information.json')
		.then((response)=>response.json())
		.then((json)=>{
			Object.assign(input,json);
			return input;
		})
}

export function componentDataLoad({dispatch}) {
	return function(next){
		return function(action){
			if (action.type === REQUEST_DATA_LOAD){
				const rawLocation = new Object;
				const rawStation = new Object;
				const rawInfo = new Object;
				Promise.all([getLocation_v2(rawLocation),getStation(rawStation),getInfo(rawInfo)])
				.then(
					(rawData)=>{
						dispatch({
							type: DATA_LOAD_SUCCESS,
							payload: {
								location: rawLocation,
								stations: rawStation,
								info: rawInfo
							}
						})
					}
				)
			}
			return next(action);
		}
	}
}


/*
export function getStations (refreshedData, dispatch) {
	Promise.all([getLocation(refreshedData),getStation(refreshedData),getInfo(refreshedData)])
		.then((refreshedData) => {
			dispatch({
				type: REFRESH_DATA_SUCCESS,
				payload: combineData(refreshedData)
			})
			console.log(combineData(refreshedData))
		})
}*/