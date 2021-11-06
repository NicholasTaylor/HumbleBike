import { useState, useEffect, useCallback } from 'react';
import GetStation from './components/GetStation';
import UpdateDistance from './components/UpdateDistance';
import Station from './components/Station';
import SortStations from './components/SortStations';
import Logo from './components/Logo';
import CustomFonts from './components/Fonts';
import Haversine from './components/Haversine';
import Options from './components/Options';
import { fontFamily, inter, fontSize, fontWeight, space } from './constants/style';
import { css, jsx } from '@emotion/react';
/** @jsxRuntime classic */
/** @jsx jsx */;

export default function AppHooksTest() {
  const [location, setLocation] = useState({});
  const [error, setError] = useState(null);
  const [stations, setStations] = useState([]);
  const [timedRefresh, setTimedRefresh] = useState(0);
  const [manualRefresh, setManualRefresh] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [searchQuery, setSearchQuery] = useState('');

  const SearchBlank = () => {
    const searchStations = useCallback((e) => {
      if (e !== undefined) {
        setSearchQuery(e.target.value);
      }
    },[]);
    /*
    const searchStations = useCallback((e) => {
      const visArr = [];
      const q = e.target.value ? e.target.value : searchQuery;
      setSearchQuery(q);
      const stationsCopy = [...stations];
      for (let i = 0; i < stationsCopy.length; i++) {
        const isVisible = q.length === 0 || stations[i].name.toLowerCase().includes(q.toLowerCase()) ? true : false;
        visArr.push({
          'name': stations[i].name,
          'isVisible': isVisible
        });
      }
      setStations(Object.assign(stationsCopy,visArr));
      
    },[]);
    */
    return(
      <span
        css={css`
          font-weight: ${fontWeight['bold']};
          margin: ${space[3]};
          display: inline-block;
        `}
      >
        Search: <input
          type="text"
          label="search"
          value={searchQuery}
          onChange={(e) => searchStations(e)}
        />
      </span>
    )
  }

  const RefreshButton = () => {
    const handleClick = useCallback((e) => {
      setManualRefresh(manualRefresh + 1);
    }, []); 

    return(
      <button
        css={css`
          font-size: ${fontSize[1]};
          line-height: ${fontSize[2]};
          font-weight: ${fontWeight['bold']};
          margin: ${space[3]};
          display: inline-block;
          border: #808080 1px solid;
          padding: ${space[1]} ${space[2]};
          border-radius: ${space[2]};
          background-color: transparent;
        `}
        onClick={handleClick}
      >
        Refresh&nbsp;
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="black" 
          css={css`
            height: auto;
            width: 1em;
          `}
        >
          <path 
            fillRule="evenodd" 
            d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" 
            clipRule="evenodd"
          />
        </svg>
      </button>
    )
  }

  useEffect(() => {
    const autoRefresh = setInterval(() => {
      console.log('Refreshing');
      setTimedRefresh(timedRefresh + 1);
    },10000);
    const onLocationChange = ({coords}) => {
      const minDist = 0.0075;
      const locDelta = Haversine(location.latitude, location.longitude, coords.latitude, coords.longitude,5);
      console.log(`locDelta = ${locDelta}\nminDist = ${minDist}\nerror = ${error}\ncoords = ${coords.latitude}, ${coords.longitude}`);
      if (locDelta > minDist || error || !(locDelta)){
        console.log('Firing.');
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude
        });
      }
    };

    const onError = (error) => {
        setError(error.message);
    };

    const endpointInfo = 'https://gbfs.citibikenyc.com/gbfs/en/station_information.json';
    const endpointStatus = 'https://gbfs.citibikenyc.com/gbfs/en/station_status.json';

    Promise.all([GetStation(endpointInfo),GetStation(endpointStatus)])
      .then((results) => {
        const allStationInfo = results[0].data.stations;
        const allStationStatus = results[1].data.stations;
        const blankQuery = searchQuery.length === 0 ? true : false;
        const payload = [];
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
        for (let status_idx = 0; status_idx < allStationStatus.length; status_idx++) {
          let station = allStationStatus[status_idx];
          let target = stationMap[station.station_id];
          if (target) {
            const statusData = {
              classic: (station.num_bikes_available - station.num_ebikes_available),
              electric: station.num_ebikes_available,
              docks: station.num_docks_available,
              isVisible: blankQuery || target.name.toLowerCase().includes(searchQuery.toLowerCase()) ? true : false
            };
            Object.assign(target,statusData);
            payload.push(target);
          }
        }
        return payload
      })
      .then((stationList) => {
        setStations(SortStations(stationList,false));
        setLastUpdated(new Date().toLocaleString());
        return stationList;
      })
      .then((stationListSaved) => {
        if (location && stationListSaved && !(error)){
          setStations(SortStations(UpdateDistance(location.latitude, location.longitude, stationListSaved),true));
        }
      });
  
    const geo = navigator.geolocation;
    if (!geo) {
        setError('Location not available.');
        return;
    }
    const update = geo.watchPosition(onLocationChange, onError);
    return () => {
      geo.clearWatch(update);
      clearInterval(autoRefresh);
    };
  },[location, error, timedRefresh, manualRefresh, searchQuery])

  return (
    <div>
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
                font-size: ${fontSize[1]};
                line-height: ${fontSize[1]};
              `}
            >
              Last updated: <strong>{lastUpdated}</strong>
            </div>
            <RefreshButton />
            <SearchBlank />
          </div>
          { stations.map((station) => <Station key={station.station_id} data={station} />) }
        </div>
      </div>
    </div>
  );
}
