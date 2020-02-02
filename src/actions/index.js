import {GET_LOCATION, GET_INFO, GET_STATION} from '../constants/action-types';

export function get_location(payload){
	return {type:GET_LOCATION}
}

export function get_info () {
	return function(dispatch){
		return fetch('https://gbfs.citibikenyc.com/gbfs/en/station_information.json')
		.then((response)=>response.json())
		.then((json)=>{
			dispatch({
				type: GET_INFO,
				payload: json
			})
		})
	}
}

export function get_station () {
	return function(dispatch){
		return fetch('https://gbfs.citibikenyc.com/gbfs/en/station_status.json')
		.then((response)=>response.json())
		.then((json)=>{
			dispatch({
				type: GET_STATION,
				payload: json
			})
		})
	}
}