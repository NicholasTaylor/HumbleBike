import React from 'react';
import Logo from './components/Logo'
import CustomFonts from './components/Fonts'
import TestStation from './components/TestStation'
import './App.css';
import {connect} from 'react-redux';
import {get_location, get_info, get_station} from './actions/index'
import {getDistanceArr} from './middleware/index';

class StationList extends React.Component {
  constructor(props){
    super(props)
  }
}

class App extends React.Component {
  constructor(props){
    super(props)
    this.state={
      TestStations: [
        {
          name: 'Marcy Ave & Lafayette Ave',
          dist: 0.06,
          classic: 10,
          electric: 0,
          docks: 13
        },
        {
          name: 'Kosciuszko St & Tompkins Ave',
          dist: 0.15,
          classic: 8,
          electric: 0,
          docks: 10
        },
        {
          name: 'Kosciuszko St & Nostrand Ave',
          dist: 0.17,
          classic: 7,
          electric: 0,
          docks: 15
        },
        {
          name: 'Greene Ave & Nostrand Ave',
          dist: 0.23,
          classic: 7,
          electric: 0,
          docks: 15
        },
        {
          name: 'Willoughby Ave & Tompkins Ave',
          dist: 0.25,
          classic: 4,
          electric: 0,
          docks: 15
        },
        {
          name: 'Myrtle Ave & Marcy Ave',
          dist: 0.32,
          classic: 2,
          electric: 0,
          docks: 21
        },
      ]
    }
  }

  componentDidMount(){
    const componentDataLoad = () => {
      return new Promise(
        (resolve,reject)=>{
          this.props.get_location();
          resolve();
        }
      )
      .then(
        (resolve,reject)=>{
          this.props.get_station();
        }
      )
      .then(
        (resolve,reject)=>{
          this.props.get_info();
        }
      )
    }
    componentDataLoad();
  }

  genTestStation(i) {
    const stationData = this.state.TestStations[i];
    return (      
      <TestStation 
        name={stationData.name}
        dist={stationData.dist}
        classic={stationData.classic}
        electric={stationData.electric}
        docks={stationData.docks}
      />
    );
  }

  render(){
    return (
      <div>
        <CustomFonts />
        <div id="container">
          <div id="content">
            <Logo />
            {this.genTestStation(0)}
            {this.genTestStation(1)}
            {this.genTestStation(2)}
            {this.genTestStation(3)}
            {this.genTestStation(4)}
            {this.genTestStation(5)}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state){
  return {
    location: state.location,
    stations: state.stations,
    info: state.info
  };
}


export default connect(mapStateToProps,{get_location, get_info, get_station})(App);

