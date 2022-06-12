import { useState, useEffect, useCallback } from "react";
import GetStation from "./components/GetStation";
import UpdateDistance from "./components/UpdateDistance";
import Station from "./components/Station";
import SortStations from "./components/SortStations";
import Logo from "./components/Logo";
import CustomFonts from "./components/Fonts";
import Haversine from "./components/Haversine";
import {
  fontFamily,
  inter,
  fontSize,
  fontWeight,
  space,
} from "./constants/style";
import { css, jsx } from "@emotion/react";
import { NYC_API } from "./constants/config";
/** @jsxRuntime classic */
/** @jsx jsx */ export default function App() {
  const [location, setLocation] = useState({});
  const [error, setError] = useState(null);
  const [stationInfo, setStationInfo] = useState({});
  const [stations, setStations] = useState([]);
  const [timedRefresh, setTimedRefresh] = useState(0);
  const [manualRefresh, setManualRefresh] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleString());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterElec, setFilterElec] = useState(false);
  const [filterElecFree, setFilterElecFree] = useState(false);
  const [filterDock, setFilterDock] = useState(false);
  const [options, setOptions] = useState(false);
  const [useTripPlanner, setUseTripPlanner] = useState(false);
  const [searchClicks, setSearchClicks] = useState(0);
  const [address, setAddress] = useState({});
  const [inputErrors, setInputErrors] = useState(null);
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [zip, setZip] = useState('');

  const endpointInfo =
    "https://gbfs.citibikenyc.com/gbfs/en/station_information.json";
  const endpointStatus =
    "https://gbfs.citibikenyc.com/gbfs/en/station_status.json";
  const endpointAddress = "https://api.nyc.gov/geo/geoclient/v1/address.json";
  const dispViewElems = `${useTripPlanner ? `none`: `block`}`;
  const dispViewElemsFlex = `${useTripPlanner ? `none`: `flex`}`;
  const dispTripElems = `${useTripPlanner ? `block`: `none`}`;

  /* Start: Click Handlers and Toggles */
  const handleClick = () => {
    setManualRefresh(manualRefresh + 1);
  }

  const handleClickTrip = () => {
      setUseTripPlanner(!useTripPlanner);
  };

  const toggleElec = () => {
    setFilterElec(!filterElec);
  };

  const toggleDock = () => {
    setFilterDock(!filterDock);
  };

  const toggleElecFree = () => {
    setFilterElecFree(!filterElecFree);
  };

  const toggleOptions = () => {
    const animateOptions = new Promise((resolve, reject) => {
      const icon = document.getElementById("options-icon");
      const panel = document.getElementById("options-panel");
      if (options) {
        icon.classList.remove("iconOn");
        panel.classList.remove("panelOn");
        icon.classList.add("iconOff");
        panel.classList.add("panelOff");
      } else {
        icon.classList.remove("iconOff");
        panel.classList.remove("panelOff");
        icon.classList.add("iconOn");
        panel.classList.add("panelOn");
      }
      resolve(true);
    });
    animateOptions.then(setOptions(!options));
  };
  /*End: Click Handlers and Toggles */

  /*Start: Callbacks */
  const updateInput = useCallback((e) => {
    e.preventDefault();
    if (e === undefined) {
      return;
    }
    let newVal = e.target.value;
    switch(e.target.id){
      case 'street':
        setStreet(newVal);
        break;
      case 'houseNumber':
        setHouseNumber(newVal);
        break;
      case 'zip':
        setZip(newVal);
        break;
      case 'search':
        setSearchQuery(newVal);
        break;
    }
  }, []);

  const updateStationDist = useCallback(
    (stationList) => {
      if (location && stationList && !error) {
        return SortStations(
          UpdateDistance(location.latitude, location.longitude, stationList),
          true
        );
      } else {
        return SortStations(stationList, false);
      }
    },
    [error, location]
  );

  const searchDestAddr = () => {
    const inputs = [
      {
        name: `street`,
        value: street,
      },
      {
        name: `houseNumber`,
        value: houseNumber,
      },
      {
        name: `zip`,
        value: zip,
      },
    ];
    const validationErrs = [];

    const validateNoNulls = (fieldName, fieldValue) => {
      return fieldValue.length > 0
        ? false
        : `Please provide a value for ${fieldName}`;
    };
  
    const validateZip = (zip) => {
      return zip.length === 5 && zip.match(/^[0-9]*$/) !== null
        ? false
        : `Please provide a valid US zip code (5 digit number).`;
    };
    
    for (let i = 0; i < inputs.length; i++) {
      let input = inputs[i];
      let noNullResult = validateNoNulls(input.name, input.value);
      if (noNullResult) {
        validationErrs.push(noNullResult);
      }
    }
    let zipError = validateZip(inputs[2].value);
    if (zipError) {
      validationErrs.push(zipError);
    }
    if (validationErrs.length > 0) {
      let output = ``;
      for (let i = 0; i < validationErrs.length; i++) {
        let validationErr = validationErrs[i];
        let newline = i === validationErrs - 1 ? `<br />` : ``;
        output += `${validationErr}${newline}`;
      }
      setInputErrors(output);
    } else {
      setAddress({
        street: inputs[0].value,
        houseNumber: inputs[1].value,
        zip: inputs[2].value,
      });
      setInputErrors(null);
      setSearchClicks(searchClicks+ 1)
    }
  };

  const getStationInfo = useCallback(() => {
    if (Object.keys(stationInfo).length === 0) {
      GetStation(endpointInfo).then((response) => {
        const allStationInfo = response.data.stations;
        const stationMap = {};
        for (let info_idx = 0; info_idx < allStationInfo.length; info_idx++) {
          let station = allStationInfo[info_idx];
          stationMap[station.station_id] = {
            station_id: station.station_id,
            lat: station.lat,
            lon: station.lon,
            name: station.name,
          };
        }
        setStationInfo(stationMap);
      });
    }
    return stationInfo;
  }, [stationInfo]);
  /*End: Callbacks */

  /* Start Effect: Fetch Citi Bike data
  Fetches the most up-to-date data from Citi Bike's servers. */
  useEffect(() => {
    const autoRefresh = setInterval(() => {
      setTimedRefresh(timedRefresh + 1);
    }, 10000);

    const requestDataLoad = () => {
      Promise.all([getStationInfo(), GetStation(endpointStatus)]).then(
        (results) => {
          const stationMap = results[0];
          const allStationStatus = results[1].data.stations;
          const payload = [];

          for (
            let status_idx = 0;
            status_idx < allStationStatus.length;
            status_idx++
          ) {
            let station = allStationStatus[status_idx];
            let target = stationMap[station.station_id];
            if (target) {
              const statusData = {
                classic:
                  station.num_bikes_available - station.num_ebikes_available,
                electric: station.num_ebikes_available,
                docks: station.num_docks_available,
                isVisible: true,
              };
              Object.assign(target, statusData);
              payload.push(target);
            }
          }
          setStations(updateStationDist(payload));
          setLastUpdated(new Date().toLocaleString());
        }
      );
    };

    requestDataLoad();

    return () => {
      clearInterval(autoRefresh);
    };
  }, [timedRefresh, manualRefresh, error, getStationInfo, updateStationDist]);
  /* End Effect: Fetch Citi Bike data */

  /* Start Effect: Fetch geolocation data
  Gets/updates user's location in lat/lon computes distance to all docks based on current geo data. Fires on regular intervals. */
  useEffect(() => {
    const geo = navigator.geolocation;

    const onError = (error) => {
      setError(error.message);
    };

    const onLocationChange = ({ coords }) => {
      if (!geo) {
        setError("Location not available.");
        return;
      }
      const minDist = 0.0075;
      const locDelta = Haversine(
        location.latitude,
        location.longitude,
        coords.latitude,
        coords.longitude,
        5
      );
      if (locDelta > minDist || error || isNaN(locDelta)) {
        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      }
    };

    const update = geo.watchPosition(onLocationChange, onError);
    setStations((s) => updateStationDist({ ...s }));

    return () => {
      geo.clearWatch(update);
    };
  }, [location, error, updateStationDist]);
  /* End Effect: Fetch geolocation data*/

  /* Start Effect: Update search results
  Toggles visibility for stations based on search query; fires whenever query or stations have been changed*/
  useEffect(() => {
    const blankQuery = searchQuery.length === 0 ? true : false;
    const stationCopy = { ...stations };
    for (let station in stationCopy) {
      const target = stationCopy[station];
      const source = {
        name: target.name,
        isVisible:
          blankQuery ||
          searchQuery.toLowerCase().split(' ').reduce((acc, cur) => {return acc === true && target.name.toLowerCase().indexOf(cur) !== -1 ? true : false}, true)
            ? true
            : false,
      };
      Object.assign(target, source);
    }
  }, [searchQuery, stations]);
  /* End Effect: Update search results */

  /* Start Effect: Convert Destination to Lat/Lon
  Searches an NYC government API for the address the user provided. If it exists, it'll return coordinates. If it doesn't, it'll return an array of addresses the API suspects the user actually means.
  */

  useEffect(() => {
    const uri = `${endpointAddress}?street=${address.street}&houseNumber=${address.houseNumber}&zip=${address.zip}`;
    if (Object.values(address).length > 0) {
      fetch(uri,{
        method: 'GET',
        headers: {
          'Ocp-Apim-Subscription-Key': NYC_API
        }
      })
        .then((response) => { return response.json() })
        .then((json) => { console.log(`Lat: ${json.address.latitude}}\nLon: ${json.address.longitude}`) })
    } else {
    }
  }, [searchClicks])

  /* End Effect: */

  return (
    <div
      css={css`
        font-size: 100%;
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
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
                  flex-direction: row;
                  margin: ${space[4]} ${space[0]} ${space[0]} ${space[0]};
                `}
              >
                <div
                    css={css`
                    font-size: ${fontSize[3]};
                    line-height: ${fontSize[3]};
                    font-weight: ${fontWeight["bold"]};
                    text-align: center;
                    border: 1px solid #808080;
                    border-radius: ${space[4]} ${space[4]} ${space[0]}
                        ${space[0]};
                    flex: 1 1 50%;
                    padding: ${space[3]} ${space[0]};
                    `}
                >
                    <button
                    href="#"
                    css={css`
                        background-color: transparent;
                        border: none;
                        font-weight: ${fontWeight["bold"]};
                        color: #000;
                    `}
                    onClick={useTripPlanner ? (e) => handleClickTrip(e) : undefined}
                    >
                    Viewer
                    </button>
                </div>
                <div
                    css={css`
                    font-size: ${fontSize[3]};
                    line-height: ${fontSize[3]};
                    font-weight: ${fontWeight["bold"]};
                    text-align: center;
                    border: 1px solid #808080;
                    border-radius: ${space[4]} ${space[4]} ${space[0]}
                        ${space[0]};
                    flex: 1 1 50%;
                    padding: ${space[3]} ${space[0]};
                    `}
                >
                    <button
                    href="#"
                    css={css`
                        background-color: transparent;
                        border: none;
                        font-weight: ${fontWeight["bold"]};
                        color: #000;
                    `}
                    onClick={useTripPlanner ? undefined : (e) => handleClickTrip(e)}
                    >
                    Trip Planner
                    </button>
                </div>
            </div>
            <div
              css={css`
                display: ${dispViewElemsFlex};
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
                    font-weight: ${fontWeight["bold"]};
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
                  font-weight: ${fontWeight["bold"]};
                  margin: ${space[3]};
                  display: inline-block;
                `}
              >
                <input
                  type="text"
                  label="search"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => updateInput(e)}
                  id="search"
                  css={css`
                    box-sizing: border-box;
                    width: 100%;
                    font-family: ${inter}, ${fontFamily};
                    font-weight: ${fontWeight["bold"]};
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
          <div>
            <div
              css={css`
                display: ${dispViewElems};
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
                input[type="checkbox"] {
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
                  font-weight: ${fontWeight["bold"]};
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
                    enable-background: new 0 0 1000 1000;
                    margin: 0 ${space[3]};
                    width: ${fontSize[2]};
                    height: auto;
                    transform: rotate(0deg);
                    transition: 0.5s ease-in-out;
                    line {
                      fill: none;
                      stroke: #000000;
                      stroke-width: 64;
                      stroke-miterlimit: 10;
                    }
                  `}
                  onClick={(e) => toggleOptions(e)}
                >
                  <line x1="-207.13" y1="499.81" x2="1207.08" y2="499.81" />
                  <line x1="499.55" y1="-207.04" x2="499.55" y2="1207.17" />
                </svg>
              </div>
              <div
                id="options-panel"
                css={css`
                  > div {
                    font-weight: ${fontWeight["bold"]};
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
                    checked={filterElec ? "checked" : ""}
                  />
                </div>
                <div>
                  Docks Only?
                  <input
                    type="checkbox"
                    label="Docks Only?"
                    onChange={(e) => toggleDock(e)}
                    checked={filterDock ? "checked" : ""}
                  />
                </div>
                <div>
                  Electric with No Classic?
                  <input
                    type="checkbox"
                    label="Electric with No Classic?"
                    onChange={(e) => toggleElecFree(e)}
                    checked={filterElecFree ? "checked" : ""}
                  />
                  {/* Convert this to a help icon item - <i>(CitiBike waives e-bike charges if there are only e-bikes at a station at the start of the ride)</i> */}
                </div>
              </div>
            </div>
          </div>
          <div
            css={css`
                display: ${dispViewElems};
                section.stationOff,
                .filterElecOn section.elecOff,
                .filterElecFreeOn section.elecFreeOff,
                .filterElecDockOn section.dockOff {
                display: none;
                }
            `}
          >
            <div
              className={
                (filterElec ? "filterElecOn" : "filterElecOff") +
                " " +
                (filterElecFree ? "filterElecFreeOn" : "filterElecFreeOff") +
                " " +
                (filterDock ? "filterDockOn" : "filterDockOff")
              }
            >
              {stations.map((station) => (
                <Station key={station.station_id} data={station} />
              ))}
            </div>
          </div>
          <div
            css={css`
                display: ${dispTripElems};
                button, input {
                  width: 100%;
                  font-family: ${inter}, ${fontFamily};
                  font-weight: ${fontWeight["bold"]};
                  font-size: ${fontSize[4]};
                  padding: 0 ${space[4]};
                  line-height: ${fontSize[7]};
                  position: relative;
                  margin: ${space[3]} 0;
                  border-radius: ${space[4]};
                }
                input {
                  box-sizing: border-box;
                  border: 1px solid #808080;
                }
                button {
                  background-color: black;
                  color: white;
                  border: none;
                }
            `}
          >
            <input
              type="text"
              label="houseNumber"
              placeholder="House Number"
              id="houseNumber"
              value={houseNumber}
              onChange={(e) => updateInput(e)}              
            />
            <input
              type="text"
              label="street"
              placeholder="Street"
              id="street"
              value={street}
              onChange={(e) => updateInput(e)}              
            />
            <input
              type="text"
              label="zip"
              placeholder="Zip"
              id="zip"
              value={zip}
              onChange={(e) => updateInput(e)}              
            />
            <button
              onClick={(e) => searchDestAddr(e.value)}
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}