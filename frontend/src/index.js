import React from 'react';
import ReactDOM from 'react-dom';
import './bootstrap.min.css';
import './index.css';
import AppHooksTest from './App-Hooks-Test';
import store from './store/index.js'
import { Provider } from 'react-redux';

ReactDOM.render(
	<Provider
		store={store}
	>
		<AppHooksTest />
	</Provider>,
	document.getElementById('root'));
