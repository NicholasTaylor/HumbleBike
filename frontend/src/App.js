import { useEffect, useReducer, useCallback } from "react";
import { css, jsx } from "@emotion/react";

import Logo from "./components/Logo";
import CustomFonts from "./components/Fonts";
import Station from "./components/Station";

import Haversine from "./functions/Haversine";
import FetchData from "./functions/FetchData";
import UpdateDistance from "./functions/UpdateDistance";
import SortStations from "./functions/SortStations";

import { fontFamily, inter, fontSize, fontWeight, space } from "./constants/style";
import { UPDATE_STATION_STATUS, UPDATE_STATION_DIST, GET_STATION_INFO, TOGGLE_FILTER,  UPDATE_LOCATION, UPDATE_VALUE, UPDATE_TRIP_STATIONS } from "./constants/action-types";
import { endpointInfo, endpointStatus, endpointAddress } from "./constants/endpoints";
import { NYC_API } from "./constants/config";

/** @jsxRuntime classic */
/** @jsx jsx */

export default function App() {
  const initialState = {
    stationInfo: {},
    stations: [],
    locationLive: {},
    location: {},
    lastUpdated: new Date().toLocaleString(),
    useTripPlanner: false,
    options: false,
    filterElec: false,
    filterElecFree: false,
    filterDock: false,
    searchQuery: ``,
    error: null,
    tripHouseNumber: ``,
    tripStreet: ``,
    tripBorough: ``,
    tripAddress: {},
    tripLocation: {},
    tripStations: [],
    tripError: null,
    isModalError: false
  }

  const reducer = (state, action) => {
    switch (action.type) {
      case UPDATE_VALUE:
        console.log(`This fired. Type: ${action.type}`)
        return {
          ...state,
          [action.payload.fieldName]: action.payload.value
        }
      case UPDATE_LOCATION:
        console.log(`This fired. Type: ${action.type}`)
        const locType = action.payload.locType ? action.payload.locType : `default`;
        if (locType === `trip`){
          return {
            ...state,
            tripLocation: action.payload.tripLocation
          }
        } else {
          const locationLive = action.payload.location;
          const location = { ...state.location };
          const error = { ...state.error };
          const minDist = 0.0075;
          const locDelta = Haversine(
            location.latitude,
            location.longitude,
            locationLive.latitude,
            locationLive.longitude,
            5
          );
          if (locDelta > minDist || error || isNaN(locDelta)) {
            return {
              ...state,
              location: locationLive
            }
          }
        }
        break;
      case UPDATE_TRIP_STATIONS:
        console.log(`This fired. Type: ${action.type}`)
        if (Object.keys(state.tripLocation).length > 0 && state.tripStations.length > 0){
          return {
            ...state,
            tripStations: SortStations(UpdateDistance(state.tripLocation.latitude, state.tripLocation.longitude, state.tripStations), true)
          }
        } else {
          return {
            ...state
          }
        }
      case TOGGLE_FILTER:
        console.log(`This fired. Type: ${action.type}`)
        let filterName = action.payload.filterName;
        if (filterName){
          return {
            ...state,
            [filterName] : !(state[filterName])
          }
        }
        break;
      case GET_STATION_INFO:
        console.log(`This fired. Type: ${action.type}`)
        return {
          ...state,
          stationInfo: action.payload
        }
      case UPDATE_STATION_STATUS:
        console.log(`This fired. Type: ${action.type}`)
        let infoLen = Object.keys(state.stationInfo).length;
        let tripStationsLen = state.tripStations.length;
        if (infoLen > 0 && tripStationsLen === 0){
          return {
            ...state,
            stations: action.payload.stations,
            tripStations: action.payload.stations,
            lastUpdated: action.payload.lastUpdated
          } 
        } else if (infoLen > 0){
          return {
            ...state,
            stations: action.payload.stations,
            lastUpdated: action.payload.lastUpdated
          } 
        } else {
          return {
            ...state
          }
        }      
      case UPDATE_STATION_DIST:
        console.log(`This fired. Type: ${action.type}`)
        const stationList = [ ...state.stations ];
        if (state.location && stationList && !state.error) {
          return {
            ...state,
            stations: SortStations(UpdateDistance(state.location.latitude, state.location.longitude, stationList), true)
          }
        } else {
          return {
            ...state,
            stations: SortStations(stationList, false)
          }
        }
      default:
    }
  }

  const [state, dispatch]  = useReducer(reducer, initialState);
  
  const dispViewElems = `${state['useTripPlanner'] ? `none`: `block`}`;
  const dispViewElemsFlex = `${state['useTripPlanner'] ? `none`: `flex`}`;
  const dispTripElems = `${state['useTripPlanner'] ? `block`: `none`}`;

  /* Start: Helpers and Handles */

  const getStationStatus = useCallback(() => {
    FetchData(endpointStatus)
    .then((response) => {
      const stationMap = { ...state.stationInfo }
      const allStationStatus = response.data.stations;
      const stations = [];
      for (let status_idx = 0; status_idx < allStationStatus.length; status_idx++) {
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
          stations.push(target);
        }
      }
      return [
        stations, new Date().toLocaleString()
      ]     
    })
    .then((payload) => {
      const [stations, lastUpdated] = payload;
      dispatch({
        type: UPDATE_STATION_STATUS,
        payload: {
          stations: stations,
          lastUpdated: lastUpdated
        }
      })
    })
    .then(()=>{
      dispatch({
        type: UPDATE_STATION_DIST
      }) 
    })
  },[state.stationInfo]) 

  const updateInput = (e, doUpdateStation = false) => {
    const updateQuery = new Promise((resolve) => {
      dispatch({
        type: UPDATE_VALUE, 
        payload: {
          fieldName: e.target.id,
          value: e.target.value
        }
      });
      resolve(true);
    })
    updateQuery
    .then(() => {
      const blankQuery = state.searchQuery.length === 0 ? true : false;
      if (blankQuery || !doUpdateStation){
        return null;
      }
      const stationCopy = [ ...state.stations ];
      for (let station in stationCopy) {
        const target = stationCopy[station];
        const source = {
          name: target.name,
          isVisible:
            blankQuery ||
            state.searchQuery.toLowerCase().split(' ').reduce((acc, cur) => {return acc === true && target.name.toLowerCase().indexOf(cur) !== -1 ? true : false}, true)
              ? true
              : false,
        };
        Object.assign(target, source);
      }
      return stationCopy;
    })
    .then( (visibleArr) =>
      { 
        if (visibleArr){
          dispatch({
            type: UPDATE_VALUE,
            payload: {
              fieldName: 'stations',
              value: visibleArr
            }
          })
        }
      }
    )
  }

  const searchDestAddr = () => {
    const inputs = [
      {
        name: `street`,
        value: state.tripStreet,
      },
      {
        name: `houseNumber`,
        value: state.tripHouseNumber,
      },
      {
        name: `borough`,
        value: state.tripBorough,
      },
    ];
    const validationErrs = [];

    const validateNoNulls = (fieldName, fieldValue) => {
      return fieldValue.length > 0
        ? false
        : `Please provide a value for ${fieldName}`;
    };
    
    for (let i = 0; i < inputs.length; i++) {
      let input = inputs[i];
      let noNullResult = validateNoNulls(input.name, input.value);
      if (noNullResult) {
        validationErrs.push(noNullResult);
      }
    }

    if (validationErrs.length > 0) {
      let output = ``;
      for (let i = 0; i < validationErrs.length; i++) {
        let validationErr = validationErrs[i];
        let newline = i === validationErrs - 1 ? `<br />` : ``;
        output += `${validationErr}${newline}`;
      }
      dispatch({
        type: UPDATE_VALUE,
        payload: {
          fieldName: 'tripError',
          value: output
        }
      });
    } else {
      dispatch({
        type: UPDATE_VALUE,
        payload: {
          fieldName: 'tripAddress',
          value: {
            street: inputs[0].value,
            houseNumber: inputs[1].value,
            borough: inputs[2].value,
          }
        }
      })
      dispatch({
        type: UPDATE_VALUE,
        payload: {
          fieldName: 'tripError',
          value: null
        }
      })
    }
  };

  /* End: Helpers and Handles */

  /* Start: Effects */
  /* Start Effect: Fetch initial data
  Fetches and populates static station data (name, coordinates) and the user's geolocation coordinates (if possible). Should only run once per session. */
  useEffect(()=>{
    FetchData(endpointInfo)
      .then((response) => {
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
          return stationMap;
      })
      .then((stationMap) => {
        dispatch({
          type: GET_STATION_INFO,
          payload: stationMap
        })
      });
      const geo = navigator.geolocation;

      const onError = (error) => {
        dispatch({
          type: UPDATE_VALUE,
          payload: {
            fieldName: 'error',
            value: error.message
          }
        })
      };
      const onLocationChange = ({ coords }) => {
        if (!coords) {
          dispatch({
            type: UPDATE_VALUE,
            payload: {
              fieldName: 'error',
              value:  `Location not available.`
            }
          });
          return;
        } else {
          dispatch({
            type: UPDATE_VALUE,
            payload: {
              fieldName: 'locationLive',
              value: {
                latitude: coords.latitude,
                longitude: coords.longitude
              }
            }
          })
        }
      };

      const update = geo.watchPosition(onLocationChange, onError);
      return () => {
        geo.clearWatch(update);
      };
  },[])
  /* End Effect: Fetch initial data */

  /* Start Effect: Update Location */
  useEffect(() => {
    dispatch({
      type: UPDATE_LOCATION,
      payload: {
        locType: `default`,
        location:  {
            latitude: state.locationLive.latitude,
            longitude: state.locationLive.longitude
        }
      }
    })
  },[state.locationLive]);
  /* End Effect: Update Location */

  /* Start Effect: Fetch dynamic station data
  Fetches and updates dynamic, changing station data - like bike and dock availability */
  useEffect(()=>{
    getStationStatus();
  },[getStationStatus])
  /* End Effect: Fetch dynamic station data */

  /* Start Effect: Update Distance to Stations 
  Updates "dist" property in every station whenever user's location changes */
  useEffect(() => {
    dispatch({
      type: UPDATE_STATION_DIST
    })    
  },[state.location, state.error])
  /* End Effect: Update Distance to Station */

  /* Start Effect: Convert Destination to Lat/Lon
  Searches an NYC government API for the address the user provided. If it exists, it'll return coordinates. If it doesn't, it'll return an array of addresses the API suspects the user actually means.
  */

  useEffect(() => {
    const address = { ...state.tripAddress }
    const uri = `${endpointAddress}?street=${address.street}&houseNumber=${address.houseNumber}&borough=${address.borough}`;

    const generateErr = (headTxt, copyTxt, isCustom = false) => {
      let modal = document.getElementById('modal-error');
      let allPrev = [modal.getElementsByTagName('h1'), modal.getElementsByTagName('h2'), modal.getElementsByTagName('copy'), modal.getElementsByClassName('err-list')];
      let headline = document.createElement('h1');
      headline.innerText = `Error`;
      let subhead = document.createElement('h2');
      subhead.innerText = headTxt;
      let copy;
      if (isCustom) {
        copy = copyTxt;
      } else {
        copy = document.createElement('p');
        copy.innerText = copyTxt;        
      }

      for (let x = 0; x < allPrev.length; x++){
        let arr = allPrev[x];
        if (arr.length > 0){
          for (let y = arr.length - 1; y >= 0; y--){
            modal.removeChild(arr[y]);
          }
        }
      }
      modal.appendChild(headline);
      modal.appendChild(subhead);
      modal.appendChild(copy);
      dispatch({type: TOGGLE_FILTER, payload: {filterName: `isModalError`}});
      return;
    }

    if (Object.values(address).length > 0) {
      fetch(uri,{
        method: 'GET',
        headers: {
          'Ocp-Apim-Subscription-Key': NYC_API
        }
      })
        .then((response) => { return response.json() })
        .then((json) => { 
          let data = json.address;
          let successCodes = ['00', '01'];
          if (successCodes.includes(data.geosupportReturnCode)){
            dispatch({
              type:UPDATE_LOCATION, 
              payload: {
                locType: `trip`, 
                tripLocation: {
                  latitude: data.latitude, 
                  longitude: data.longitude
                }
              }
            })
          } else {
            switch (data.geosupportReturnCode) {
              case '42':
                generateErr(`House Number Not Found`,`That house number doesn't exist on this street. Please double check your address.`);
                break;
              case 'EE':
                let streetArr = [];

                const TitleCase = (str) => {
                  let strArr = str.split(' ');
                  return strArr.reduce((acc, cur, idx) => {
                    let space = idx + 1 >= strArr.length ? `` : ` `;
                    let first = cur.slice(0,1);
                    let rest = cur.slice(1);
                    let curTitle = `${first.toUpperCase()}${rest.toLowerCase()}`;
                    return acc += `${curTitle}${space}`;
                  },``);
                }

                const genItemClickable = (str) => {
                  let item = document.createElement(`li`);
                  let btn = document.createElement(`button`);
                  str.split(' ')
                  btn.innerText = TitleCase(str);
                  btn.id =`street-correction`;
                  btn.onclick = (e) => { dispatch({type: UPDATE_VALUE, payload: {fieldName: 'tripStreet', value: e.target.innerText}}); dispatch({type: TOGGLE_FILTER, payload: {filterName: `isModalError`}}) };
                  item.appendChild(btn);
                  return item;
                }
                
                for (let i = 1; i <= 6; i++){
                  if (data[`streetName${i}`]){
                   streetArr.push(data[`streetName${i}`])
                  }
                }
                if (streetArr.length > 0){
                  let div = document.createElement(`div`);
                  let list = document.createElement(`ul`);
                  let para = document.createElement(`p`);
                  for (let i = 0; i < streetArr.length; i++){
                    list.appendChild(genItemClickable(streetArr[i]))
                  }
                  para.innerText = `That street doesn't seem to exist. Did you mean one of the below?`;
                  div.classList.add(`err-list`);
                  div.appendChild(para);
                  div.appendChild(list);
                  generateErr(`Street Not Found`, div, true);
                }
                break;
              default:
                break;
            }
          }
        })
    } else {
      //
    }
  }, [state.tripAddress])

  /* End Effect: Convert Destination to Lat/Lon */

  /* Start Effect: Animate Options Icon 
  Starts an animation for the options icon. Which animation depends on the current options value in state. Said property triggers this */
  useEffect(()=>{
    const icon = document.getElementById("options-icon");
    const panel = document.getElementById("options-panel");
    if (!state.options) {
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
  },[state.options])
  /* End Effect: Animate Options Icon */

  /* Start Effect: Error Modal Transition 
  Runs when isModalError changes. If new value is true, it turns on the modal's visibility. If false, it turns it off.
  */
  useEffect(()=>{
    let modal = document.getElementById(`modal-error`);
    let modalBg = document.getElementById(`modal-bg`);
      if (state.isModalError){
        modal.classList.remove(`errorOff`);
        modalBg.classList.remove(`errorOff`);
        modal.classList.add(`errorOn`);
        modalBg.classList.add(`errorOnBg`);
      } else {
        modal.classList.remove(`errorOn`);
        modalBg.classList.remove(`errorOnBg`);
        modal.classList.add(`errorOff`);
        modalBg.classList.add(`errorOff`);
      }
    },[state.isModalError])
  /* End Effect: Error Modal Transition */

  /* Start Effect: Update Distance from Destination */
  useEffect(() => {
    if (Object.keys(state.tripLocation).length > 0){
      dispatch({
        type: UPDATE_TRIP_STATIONS
      })
    }
  },[state.tripLocation])
  /* End Effect: Update Distance from Destination */
  /* End: Effects */

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
            left: 50%;
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
              Last updated: <strong>{state.lastUpdated}</strong>
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
                    ${state.useTripPlanner ? `` : `border-bottom: 0px;`}
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
                    onClick={state.useTripPlanner ? () => dispatch({ type: TOGGLE_FILTER, payload: { filterName: `useTripPlanner` } }) : undefined}
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
                    ${state.useTripPlanner ? `border-bottom: 0px;` : ``}
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
                    onClick={state.useTripPlanner ? undefined : () => dispatch({ type: TOGGLE_FILTER, payload: { filterName: `useTripPlanner` } })}
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
                  onClick={()=> {getStationStatus()}}
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
                  value={state.searchQuery}
                  onChange={(e) => updateInput(e, true)}
                  id="searchQuery"
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
                  onClick={() => dispatch({ type: TOGGLE_FILTER, payload: { filterName: `options` } })}
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
                    onChange = { () => dispatch({ type: TOGGLE_FILTER, payload: { filterName: `filterElec` } }) }
                    checked={state.filterElec ? "checked" : ""}
                  />
                </div>
                <div>
                  Docks Only?
                  <input
                    type="checkbox"
                    label="Docks Only?"
                    onChange = { () => dispatch({ type: TOGGLE_FILTER, payload: { filterName: `filterDock` } }) }
                    checked={state.filterDock ? "checked" : ""}
                  />
                </div>
                <div>
                  Electric with No Classic?
                  <input
                    type="checkbox"
                    label="Electric with No Classic?"
                    onChange = { () => dispatch({ type: TOGGLE_FILTER, payload: { filterName: `filterElecFree` } }) }
                    checked={state.filterElecFree ? "checked" : ""}
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
              .filterDockOn section.dockOff {
                display: none;
              }
            `}
          >
            <div
              className={
                (state.filterElec ? "filterElecOn" : "filterElecOff") +
                " " +
                (state.filterElecFree ? "filterElecFreeOn" : "filterElecFreeOff") +
                " " +
                (state.filterDock ? "filterDockOn" : "filterDockOff")
              }
            >
              {state.stations.length > 0 && state.stations.map((station) => (
                <Station key={station.station_id} data={station} />
              ))}
            </div>
          </div>
          <div
            css={css`
                display: ${dispTripElems};
                button, input, select {
                  width: 100%;
                  font-family: ${inter}, ${fontFamily};
                  font-weight: ${fontWeight["bold"]};
                  font-size: ${fontSize[4]};
                  line-height: ${fontSize[7]};
                  position: relative;
                  margin: ${space[3]} 0;
                  border-radius: ${space[4]};
                }
                button, input {
                  padding: 0 ${space[4]};
                }
                select {
                  padding: ${space[3]} ${space[4]};
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
              id="tripHouseNumber"
              value={state.tripHouseNumber}
              onChange={(e) => updateInput(e)}              
            />
            <input
              type="text"
              label="street"
              placeholder="Street"
              id="tripStreet"
              value={state.tripStreet}
              onChange={(e) => updateInput(e)}              
            />
            <select
              id="tripBorough"
              onChange={(e) => updateInput(e)}
            >
              <option
                value=""
              >
                Select Borough
              </option>
              <option
                value="manhattan"
              >
                Manhattan
              </option>
              <option
                value="brooklyn"
              >
                Brooklyn
              </option>
              <option
                value="queens"
              >
                Queens
              </option>
              <option
                value="bronx"
              >
                The Bronx
              </option>
              <option
                value="staten island"
              >
                Staten Island
              </option>
            </select>
            <button
              onClick={(e) => searchDestAddr(e.value)}
            >
              Search
            </button>
          </div>
          
          <div
            css={css`
                display: ${dispTripElems};
                button, input, select {
                  width: 100%;
                  font-family: ${inter}, ${fontFamily};
                  font-weight: ${fontWeight["bold"]};
                  font-size: ${fontSize[4]};
                  line-height: ${fontSize[7]};
                  position: relative;
                  margin: ${space[3]} 0;
                  border-radius: ${space[4]};
                }
                button, input {
                  padding: 0 ${space[4]};
                }
                select {
                  padding: ${space[3]} ${space[4]};
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
            {state.tripStations.length > 0 && Object.keys(state.tripLocation).length > 0 &&
              state.tripStations.slice(0,9).map((station) => (
                <Station key={`dest-${station.station_id}`} data={station} />
              ))
            }
          </div>
        </div>
        <div
          css={css`
            .errorOn {
              display: block;
              visibility: visible;
              opacity: 1;
            }
            .errorOnBg {
              display: block;
              visibility: visible;
              opacity: 0.25;
            }
            .errorOff {
              diplay: none;
              visibility: hidden;
              opacity: 0;
            }
          `}
        >
          <div
            css={css`
              display: ${dispTripElems};
            `}
          >
            <div
              id="modal-bg"
              css={css`
                display: none;
                position: absolute;
                z-index: 200;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: rgb(0, 0, 0);
                transition: 0.25s ease-in-out;
                opacity: 0;
                visiblity: hidden;
              `}
              onClick={() => {dispatch({type: TOGGLE_FILTER, payload: { filterName: `isModalError`}})}}
            >
            </div>
          </div>
          <div
            id="modal-error"
            css={css`
              display: ${dispTripElems};
              position: absolute;
              z-index: 201;
              font-family: ${inter}, ${fontFamily};
              border: 1px solid #808080;
              background-color: white;
              width: 80%;
              left: 50vw;
              top: 50vh;
              transform: translate(-50%, -50%);
              text-align: center;
              opacity: 0;
              visiblity: hidden;
              h1 {
                font-size: ${fontSize[6]};
                font-weight: ${fontWeight.bold};
                padding: ${space[1]} 0;
              }
              h2 {
                font-size: ${fontSize[3]};
                padding: ${space[1]} 0;
              }
              p {
                font-size: ${fontSize[2]};
                padding: ${space[1]} 0;
              }
              padding: ${space[2]};
              .err-list {
                ul {
                  padding: 0;
                  li {
                    list-style-type: none;
                    button {
                      font-family: ${inter}, ${fontFamily};
                      font-weight: ${fontWeight["bold"]};
                      font-size: ${fontSize[2]};
                      line-height: ${fontSize[2]};
                      position: relative;
                      margin: ${space[3]} 0;
                      border-radius: ${space[4]};
                      padding: ${space[3]} ${space[4]};
                      background-color: black;
                      color: white;
                      border: none;
                    }
                  }
                }
              }
              transition: 0.25s ease-in-out;
            `}
          >
            <div
              css={css`
                font-family: ${inter}, ${fontFamily};
                font-weight: ${fontWeight.light};
                font-size: ${fontSize[2]};
                position: absolute;
                top: ${space[2]};
                right: ${space[3]};
              `}
              onClick={() => {dispatch({type: TOGGLE_FILTER, payload: { filterName: `isModalError`}})}}
            >
              x
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}