import {DATA_LOAD_SUCCESS, REQUEST_DATA_LOAD} from '../constants/action-types.js';

const getLocation = (input) => {
	navigator.geolocation.getCurrentPosition(
		(position)=>{			
			const output = {
				lat: position.coords.latitude,
				lon: position.coords.longitude,
				isLocation: true
			}
			Object.assign(input,output);
			return input;
		},
		()=>{
			const output= {
				lat: 0,
				lon: 0,
				isLocation: false
			}
			Object.assign(input,output);
			return input;
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
				const rawLocation = {};
				const rawStation = {};
				const rawInfo = {};
				Promise.all([getLocation(rawLocation),getStation(rawStation),getInfo(rawInfo)])
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