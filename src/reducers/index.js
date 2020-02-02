import {DATA_LOAD_SUCCESS} from '../constants/action-types';

const stateInit = {
	stations: [],
	info: [],
	location: {}
};

function rootReducer(state = stateInit, action){
	if (action.type === DATA_LOAD_SUCCESS){
		return Object.assign({}, state, {
			location: action.payload.location,
			stations: action.payload.stations.data.stations,
			info: action.payload.info.data.stations,
		});
	}
	return state;
}

export default rootReducer;