import React, { useState } from 'react';
import Logo from './components/Logo'
import CustomFonts from './components/Fonts'
import './App.css';
import { connect } from 'react-redux';
import { requestDataLoad, searchStations, filterElecToggle, filterDockToggle, filterElecFreeToggle } from './actions/index';

const App = () => {
  const [stations, setStations] = useState([]);
  const [updated, setUpdated] = useState(new Date());
  const [hasLocation, setHasLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [search, setSearch] = useState('searchOff');
  const [filterElec, setFilterElec] = useState('filterElecOff');
  const [filterElecFree, setFilterElecFree] = useState('filterElecFreeOff');
  const [filterDock, setFilterDock] = useState('filterDockOff');
  return (
    <div>
      <CustomFonts />
      <div id="container">
        <div
          id="content"
          className={{ search } + ' ' + { filterElec } + ' ' + { filterElecFree } + ' ' + { filterDock }}
        >
          <Logo />
          <div
            className="panel"
          >
            <h2>
              Last updated: {updated}
            </h2>
            <span
              className="search btn"
              onClick={this.props.requestDataLoad}
            >
              Refresh
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="btn-icon">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </span>
            <span
              className="search"
            >
              Search: <input
                type="text"
                label="search"
                value={searchQuery}
                onChange={(e) => this.props.searchStations(e)}
              />
            </span>
            <span
              className="search"
            >
              <span
                className="checkbox-text"
              >
                Electric Only?
              </span><input
                type="checkbox"
                label="Electric Only?"
                onChange={(e) => this.props.filterElecToggle(e)}
                checked={filterElec === 'filterElecOn' ? 'checked' : ''}
              />
            </span>
            <span
              className="search"
            >
              <span
                className="checkbox-text"
              >
                Docks Only?
              </span><input
                type="checkbox"
                label="Docks Only?"
                onChange={(e) => this.props.filterDockToggle(e)}
                checked={filterDock === 'filterDockOn' ? 'checked' : ''}
              />
            </span>
          </div>
          <div
            id="ebike-no-classic"
          >
            <div
              className="panel"
            >
              <span
                className="search"
              >
                <span
                  className="checkbox-text"
                >
                  Electric with No Classic?
                </span><input
                  type="checkbox"
                  label="Electric with No Classic?"
                  onChange={(e) => this.props.filterElecFreeToggle(e)}
                  checked={{ filterElecFree } === 'filterElecFreeOn' ? 'checked' : ''}
                />
              </span>
            </div>
            <div
              className="panel"
            >
              <span
                className="search"
              >
                <i>(CitiBike waives e-bike charges if there are only e-bikes at a station at the start of the ride)</i>
              </span>
            </div>
          </div>
          {stations.map(el => (
            <section
              key={el.station_id}
              className={(el.isVisible ? 'stationOn' : 'stationOff') + ' ' + (el.electric > 0 ? 'elecOn' : 'elecOff') + ' ' + (el.docks > 0 ? 'dockOn' : 'dockOff') + ' ' + (el.electric > 0 && el.classic === 0 ? 'elecFreeOn' : 'elecFreeOff')}
            >
              <div className="container-station">
                <h3 className="station-name">
                  {el.name}{el.dist}
                </h3>
                <div className="infoSection classic-bikes">
                  <h4 className="bikes-remaining">
                    {el.classic}
                  </h4>
                  <h5 className="descriptor">
                    Classic
                  </h5>
                </div>
                <div className="infoSection ebikes">
                  <h4 className="ebikes-remaining">
                    {el.electric}
                  </h4>
                  <h5 className="descriptor">
                    Electric
                  </h5>
                </div>
                <div className="infoSection docks">
                  <h4 className="docks-remaining">
                    {el.docks}
                  </h4>
                  <h5 className="descriptor">
                    Docks
                  </h5>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

class App extends React.Component {
  componentDidMount() {
    this.props.requestDataLoad();
    setInterval(this.props.requestDataLoad, 10000);

  }


  componentWillUnmount() {
    clearInterval(this.props.requestDataLoad, 10000);

  }
}

function mapStateToProps(state) {
  return {
    stations: state.stations,
    updated: state.updated,
    hasLocation: state.hasLocation,
    searchQuery: state.searchQuery,
    search: state.search,
    filterElec: state.filterElec,
    filterElecFree: state.filterElecFree,
    filterDock: state.filterDock
  };
}


export default connect(mapStateToProps, { requestDataLoad, searchStations, filterElecToggle, filterDockToggle, filterElecFreeToggle })(App);
