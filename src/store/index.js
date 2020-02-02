import {createStore, applyMiddleware} from 'redux';
import rootReducer from '../reducers/index';
import thunk from 'redux-thunk';
import {getLocation} from '../middleware/index'

const store = createStore(
	rootReducer,
	applyMiddleware(thunk, getLocation)
);

export default store;