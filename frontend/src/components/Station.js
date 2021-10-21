import React from 'react';

class Station extends React.Component {
    render(){
        const station = this.props.data;
        const distInfo = station.dist ? ' (' +station.dist +'mi.)' : ''
        return(
            <div>
                <section
                className={(station.isVisible ? 'stationOn' : 'stationOff') + ' ' + (station.electric > 0 ? 'elecOn' : 'elecOff') + ' ' + (station.docks > 0 ? 'dockOn' : 'dockOff') + ' ' + (station.electric > 0 && station.classic === 0 ? 'elecFreeOn' : 'elecFreeOff')}
              >
                <div className="container-station">
                  <h3 className="station-name">
                    {station.name}{distInfo}
                  </h3>
                  <div className="infoSection classic-bikes">
                    <h4 className="bikes-remaining">
                      {station.classic}
                    </h4>
                    <h5 className="descriptor">
                      Classic
                    </h5>
                  </div>
                  <div className="infoSection ebikes">
                    <h4 className="ebikes-remaining">
                      {station.electric}
                    </h4>
                    <h5 className="descriptor">
                      Electric
                    </h5>
                  </div>
                  <div className="infoSection docks">
                    <h4 className="docks-remaining">
                      {station.docks}
                    </h4>
                    <h5 className="descriptor">
                      Docks
                    </h5>
                  </div>
                </div>
              </section>
            </div>
        )
    }
}

export default Station;