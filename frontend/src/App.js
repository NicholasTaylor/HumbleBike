import { useState, useEffect, useCallback } from 'react';
import GetStation from './components/GetStation';
import UpdateDistance from './components/UpdateDistance';
import Station from './components/Station';
import SortStations from './components/SortStations';
import Logo from './components/Logo';
import CustomFonts from './components/Fonts';
import Haversine from './components/Haversine';
import { fontFamily, inter, fontSize, fontWeight, space } from './constants/style';
import { css, jsx } from '@emotion/react';
/** @jsxRuntime classic */
/** @jsx jsx */;

export default function App() {
  const [location, setLocation] = useState({});
  const [error, setError] = useState(null);
  const [stationInfo, setStationInfo] = useState({});
  const [stations, setStations] = useState([]);
  const [timedRefresh, setTimedRefresh] = useState(0);
  const [manualRefresh, setManualRefresh] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterElec, setFilterElec] = useState(false); 
	const [filterElecFree, setFilterElecFree] = useState(false);
	const [filterDock, setFilterDock] = useState(false);
	const [options, setOptions] = useState(false);

  const endpointInfo = 'https://gbfs.citibikenyc.com/gbfs/en/station_information.json';
  const endpointStatus = 'https://gbfs.citibikenyc.com/gbfs/en/station_status.json';

  const searchStations = useCallback((e) => {
    if (e !== undefined) {
      setSearchQuery(e.target.value);
    }
  },[]);

  const handleClick = useCallback((e) => {
    setManualRefresh(manualRefresh + 1);
  }, [manualRefresh]);

  const onError = (error) => {
      setError(error.message);
  }

  const updateStationDist = useCallback((stationList) => {
    if (location && stationList && !(error)){
      return SortStations(UpdateDistance(location.latitude, location.longitude, stationList),true);
    } else {
      return SortStations(stationList,false);
    }
  },[error, location]);

  const getStationInfo = useCallback(() => {
    if (Object.keys(stationInfo).length === 0) {
      console.log('First run - station info.');
      GetStation(endpointInfo)
        .then(response => {
          const allStationInfo = response.data.stations;
          const stationMap = {};
          for (let info_idx = 0; info_idx < allStationInfo.length; info_idx++) {
            let station = allStationInfo[info_idx];
            stationMap[station.station_id] = {
              station_id: station.station_id,
              lat: station.lat,
              lon: station.lon,
              name: station.name
            };
          }
          setStationInfo(stationMap);
        })
    }
    return(stationInfo);
  },[stationInfo]);

  const toggleOptions = () => {
    const animateOptions = new Promise((resolve, reject) => {
      console.log(`options: ${options}`);
      const icon = document.getElementById('options-icon');
      const panel = document.getElementById('options-panel');
      if (options){
        icon.classList.remove('iconOn');
        panel.classList.remove('panelOn');
        icon.classList.add('iconOff');
        panel.classList.add('panelOff');
      } else {
        icon.classList.remove('iconOff');
        panel.classList.remove('panelOff');
        icon.classList.add('iconOn');
        panel.classList.add('panelOn');
      }
      resolve(true);
    });
    animateOptions
      .then(setOptions(!(options)));
  }

  const toggleElec = () => {
    setFilterElec(!(filterElec));
  }

  const toggleDock = () => {
    setFilterDock(!(filterDock));
  }

  const toggleElecFree = () => {
    setFilterElecFree(!(filterElecFree));
  }

  useEffect(()=> {
    const geo = navigator.geolocation;

    const onLocationChange = ({coords}) => {
      if (!geo) {
        setError('Location not available.');
        return;
      }
      const minDist = 0.0075;
      const locDelta = Haversine(location.latitude, location.longitude, coords.latitude, coords.longitude,5);
      console.log(`locDelta = ${locDelta}\nminDist = ${minDist}\nerror = ${error}\ncoords = ${coords.latitude}, ${coords.longitude}`);
      if (locDelta > minDist || error || isNaN(locDelta)){
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude
        });
      }
    }

    const update = geo.watchPosition(onLocationChange, onError);
    setStations(s => updateStationDist({...s}));

    return() => {
      geo.clearWatch(update);
    }
  },[location, error, updateStationDist]);


  useEffect(()=> {
    const blankQuery = searchQuery.length === 0 ? true : false;
    const stationCopy = {...stations};
    for (let station in stationCopy){
      const target = stationCopy[station];
      const source = {
        'name': target.name,
        'isVisible': blankQuery || target.name.toLowerCase().includes(searchQuery.toLowerCase()) ? true : false
      }
      Object.assign(target,source);
    }
  },[searchQuery, stations]);


  useEffect(() => {
    const autoRefresh = setInterval(() => {
      setTimedRefresh(timedRefresh + 1);
    },10000);

    const requestDataLoad = () => {
      Promise.all([getStationInfo(),GetStation(endpointStatus)])
      .then((results) => {
        const stationMap = results[0];
        const allStationStatus = results[1].data.stations;
        const payload = [];
  
        for (let status_idx = 0; status_idx < allStationStatus.length; status_idx++) {
          let station = allStationStatus[status_idx];
          let target = stationMap[station.station_id];
          if (target) {
            const statusData = {
              classic: (station.num_bikes_available - station.num_ebikes_available),
              electric: station.num_ebikes_available,
              docks: station.num_docks_available,
              isVisible: true
            };
            Object.assign(target,statusData);
            payload.push(target);
          }
        }
        setStations(updateStationDist(payload));;
        setLastUpdated(new Date().toLocaleString());
      })
    }

    requestDataLoad();

    return () => {
      clearInterval(autoRefresh);
    };
  },[timedRefresh, manualRefresh, error, getStationInfo, updateStationDist])

  return (
    <div
      css={css`
        font-size: 100%;
        h1, h2, h3, h4, h5, h6 {
          margin: 0;
          padding: 0;
        }
      `}
    >
      <CustomFonts />
      <div
        css={css`
          font-family: ${inter}, ${fontFamily};
          line-height: ${fontSize[2]};
          width: 100vw;
          position: relative;
        `}
      >
        <div
          css={css`
            position: absolute;
            width: 90vw;
            left: 50vw;
            transform: translateX(-50%);
          `}
        >
          <Logo />
          <div
            css={css`
              text-align: center;
            `}
          >
            <div
              css={css`
                font-size: ${fontSize[2]};
                line-height: ${fontSize[2]};
                margin: 0 0 ${space[3]} 0;
              `}
            >
              Last updated: <strong>{lastUpdated}</strong>
            </div>
            <div
              css={css`
                display: flex;
                flex-flow: row nowrap;
              `}
            >
              <div
                css={css`
                  width: 33%;
                `}
              >
                <button
                  css={css`
                    font-size: ${fontSize[1]};
                    line-height: ${fontSize[2]};
                    font-weight: ${fontWeight['bold']};
                    margin: ${space[3]};
                    display: inline-block;
                    border: #808080 1px solid;
                    padding: ${space[1]} ${space[2]};
                    border-radius: ${space[4]};
                    background-color: transparent;
                  `}
                  onClick={handleClick}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="black" 
                    css={css`
                      height: auto;
                      width: 4em;
                    `}
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" 
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <div
                css={css`
                  width: 67%;
                  font-weight: ${fontWeight['bold']};
                  margin: ${space[3]};
                  display: inline-block;
                `}
              > 
                <input
                  type="text"
                  label="search"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => searchStations(e)}
                  css={css`
                    box-sizing: border-box;
                    width: 100%;
                    font-family: ${inter}, ${fontFamily};
                    font-weight: ${fontWeight['bold']};
                    font-size: ${fontSize[4]};
                    padding: 0 ${space[4]};
                    line-height: ${fontSize[7]};
                    border-radius: ${space[4]};
                    border: 1px solid #808080;
                    position: relative;
                    top: 50%;
                    transform: translateY(-50%);
                  `}
                />
              </div>
            </div>
          </div>
          <div
          >
              <div
                css={css`
                  margin: ${space[4]} 0 0 0;
                  .iconOn {
                    transform: rotate(405deg);
                  }
                  .iconOff {
                    transform: rotate(0deg);
                  }
                  .panelOn {
                    visibility: visible;
                    opacity: 1;
                    max-height: 101%;
                  }
                  .panelOff {
                    visibility: hidden;
                    opacity: 0;
                    max-height: 0;
                  }
                  input[type = "checkbox"] 
                    {
                      -ms-transform: scale(2); /* IE */
                      -moz-transform: scale(2);
                      -webkit-transform: scale(2);
                      -o-transform: scale(2);
                      transform: scale(2);
                      padding: 10px;
                      margin: 0 0 0 1em;
                    }
                `}
              >
                <div
                    css={css`
                      font-size: ${fontSize[4]};
                      line-height: ${fontSize[4]};
                      font-weight: ${fontWeight['bold']};
                    `}
                >
                    Options
                    <svg 
                      id="options-icon"
                      version="1.1"
                      x="0px" 
                      y="0px"
                      viewBox="0 0 1000 1000"
                      css={css`
                        enable-background:new 0 0 1000 1000;
                        margin: 0 ${space[3]};
                        width: ${fontSize[2]};
                        height: auto;
                        transform: rotate(0deg);
                        transition: 0.5s ease-in-out;
                        line {
                          fill:none;
                          stroke:#000000;
                          stroke-width:64;
                          stroke-miterlimit:10;
                        }
                      `}
                      onClick={(e) => toggleOptions(e)}
                      >
                      <line 
                        x1="-207.13" 
                        y1="499.81" 
                        x2="1207.08" 
                        y2="499.81"
                      />
                      <line 
                        x1="499.55" 
                        y1="-207.04" 
                        x2="499.55" 
                        y2="1207.17"
                      />
                    </svg>
                </div>
                <div
                  id="options-panel"
                  css={css`
                    > div {
                      font-weight: ${fontWeight['bold']};
                      text-align: left;
                      margin: ${space[5]} 0; 
                    }

                    > div:first-of-type {
                      margin: ${space[4]} 0 ${space[5]} 0;
                    }
                    visibility: hidden;
                    max-height: 0;
                    opacity: 0;
                    transition: 0.5s ease-in-out;
                  `}
                >
                  <div>
                      Electric Only?
                      <input
                          type="checkbox"
                          label="Electric Only?"
                          onChange={(e) => toggleElec(e)}
                          checked={filterElec ? 'checked' : ''}
                      />
                  </div>
                  <div>
                      Docks Only?
                      <input
                          type="checkbox"
                          label="Docks Only?"
                          onChange={(e) => toggleDock(e)}
                          checked={filterDock ? 'checked' : ''}
                      />
                  </div>
                  <div>
                      Electric with No Classic?
                      <input
                          type="checkbox"
                          label="Electric with No Classic?"
                          onChange={(e) => toggleElecFree(e)}
                          checked={filterElecFree ? 'checked' : ''}
                      />
                      
                      {/* Convert this to a help icon item - <i>(CitiBike waives e-bike charges if there are only e-bikes at a station at the start of the ride)</i> */}
                  </div>
                </div>
              </div>
          </div>
          <div
            css={css`
              section.stationOff, .filterElecOn section.elecOff, .filterElecFreeOn section.elecFreeOff, .filterElecDockOn section.dockOff {
                  display: none;
              }
            `}
          >
            <div
              className={(filterElec ? 'filterElecOn' : 'filterElecOff') +' ' +(filterElecFree ? 'filterElecFreeOn' : 'filterElecFreeOff') +' ' +(filterDock ? 'filterDockOn' : 'filterDockOff')}
            >
              { stations.map((station) => <Station key={station.station_id} data={station} />) }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
