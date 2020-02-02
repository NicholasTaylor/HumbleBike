import {UPDATE_LOCATION, GET_INFO, GET_STATION} from '../constants/action-types';

const stateInit = {
	stations: [],
	info: [],
	location: {}
};

function rootReducer(state = stateInit, action){
	if (action.type === UPDATE_LOCATION){
		return Object.assign({}, state, {
			location: action.payload
		});
	}
	if (action.type === GET_INFO){
		return Object.assign({}, state, {
			info: action.payload.data.stations
		});
	}
	if (action.type === GET_STATION){
		return Object.assign({}, state, {
			stations: action.payload.data.stations
		});
	}
	return state;
}

export default rootReducer;