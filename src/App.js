import React from 'react';
import Logo from './components/Logo'
import CustomFonts from './components/Fonts'
import './App.css';
import {connect} from 'react-redux';
import {requestDataLoad, searchStations, filterElecToggle} from './actions/index';

class App extends React.Component {
  componentDidMount(){
    this.props.requestDataLoad();
    setInterval(this.props.requestDataLoad,10000);

  }


  componentWillUnmount(){
    clearInterval(this.props.requestDataLoad,10000);

  }

  render(){
    return (
      <div>
        <CustomFonts />
        <div id="container">
          <div 
            id="content"
            className={this.props.search + ' ' +this.props.filterElec}
          >
            <Logo />
            <div id="updated">
              <h2>
                Last updated: {this.props.updated}
              </h2>
              <span
                className="search"
              >
                Search: <input 
                  type="text"
                  label="search"
                  value={this.props.searchQuery}
                  onChange={(e)=>this.props.searchStations(e)}
                />
              </span>
              <span
                className="search"
              >
                Electric Only? <input
                  type="checkbox"
                  label="Electric Only?"
                  onChange={(e)=>this.props.filterElecToggle(e)}
                  checked={this.props.filterElec === 'filterElecOn' ? 'checked' : ''}
                />
              </span>
            </div>
            {this.props.stations.map(el =>(
              <section 
                key={el.station_id}
                className={ (el.isVisible ? 'stationOn' : 'stationOff') + ' ' + (el.electric > 0 ? 'elecOn' : 'elecOff') }
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
    );
  }
}

function mapStateToProps(state){
  return {
    stations: state.stations,
    updated: state.updated,
    hasLocation: state.hasLocation,
    searchQuery: state.searchQuery,
    search: state.search,
    filterElec: state.filterElec
  };
}


export default connect(mapStateToProps,{requestDataLoad, searchStations, filterElecToggle})(App);

