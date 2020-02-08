import {REQUEST_DATA_LOAD, SEARCH_STATIONS} from '../constants/action-types';

export function requestDataLoad(){
	return function(dispatch){
		return dispatch({type:REQUEST_DATA_LOAD})
	}
}

export function searchStations(event){
	return function(dispatch){
		return dispatch({type:SEARCH_STATIONS, payload:{searchQuery:event.target.value}})
	}
}