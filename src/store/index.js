import {createStore, applyMiddleware} from 'redux';
import rootReducer from '../reducers/index';
import thunk from 'redux-thunk';
import {componentDataLoad} from '../middleware/index'

const store = createStore(
	rootReducer,
	applyMiddleware(thunk, componentDataLoad)
);

export default store;