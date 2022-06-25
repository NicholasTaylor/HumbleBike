import { useEffect, useReducer } from "react";
import _ from 'lodash';
import { css, jsx } from "@emotion/react";

import Logo from "./components/Logo";
import CustomFonts from "./components/Fonts";
import FetchData from "./components/FetchData";
import Station from "./components/Station";

import {
  fontFamily,
  inter,
  fontSize,
  fontWeight,
  space,
} from "./constants/style";
import { UPDATE_STATION_STATUS, GET_STATION_INFO, TOGGLE_FILTER, UPDATE_QUERY, UPDATE_SEARCH } from "./constants/action-types";
import { endpointInfo, endpointStatus } from "./constants/endpoints";

/** @jsxRuntime classic */
/** @jsx jsx */

export default function App() {
  const initialState = {
    stationInfo: {},
    stations: [],
    location: {},
    lastUpdated: new Date().toLocaleString(),
    useTripPlanner: false,
    options: false,
    filterElec: false,
    filterElecFree: false,
    filterDock: false,
    searchQuery: ``,
    error: null
  }

  const reducer = (state, action) => {
    switch (action.type) {
      case UPDATE_SEARCH:
        console.log(action.payload)
        return {
          ...state,
          stations: action.payload.stations
        }
      case UPDATE_QUERY:
        return {
          ...state,
          searchQuery: action.payload.searchQuery
        }
      case TOGGLE_FILTER:
        let filterName = action.payload.filterName;
        if (filterName){
          return {
            ...state,
            [filterName] : !(state[filterName])
          }
        }
        break;
      case GET_STATION_INFO:
        return {
          ...state,
          stationInfo: action.payload
        }
      case UPDATE_STATION_STATUS:
        return {
          ...state,
          stations: action.payload.stations,
          lastUpdated: action.payload.lastUpdated
        }
      default:
    }
  }

  const [state, dispatch]  = useReducer(reducer, initialState);
  
  const dispViewElems = `${state['useTripPlanner'] ? `none`: `block`}`;
  const dispViewElemsFlex = `${state['useTripPlanner'] ? `none`: `flex`}`;
  const dispTripElems = `${state['useTripPlanner'] ? `block`: `none`}`;

  /* Start: Helpers and Handles */
  const fetchDynamic = () =>{
    FetchData(endpointStatus)
    .then((response) => {
      const stationMap = _.cloneDeep(state.stationInfo)
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
      return {
        stations: stations,
        lastUpdated: new Date().toLocaleString()
      }     
    })
    .then((payload) => {
      dispatch({
        type: UPDATE_STATION_STATUS,
        payload: payload
      })
    })
  }
  /* End: Helpers and Handles */

  /* Start: Effects */
  /* Start Effect: Fetch static station data
  Fetches and populates static station data - namely location coordinates and name. Should only run once per session. */
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
  },[])
  /* End Effect: Fetch static station data */

  /* Start Effect: Fetch dynamic station data
  Fetches and updates dynamic, changing station data - like bike and dock availability */
  useEffect(()=>{
    fetchDynamic();
  },[state.stationInfo])
  /* End Effect: Fetch dynamic station data */

  useEffect(() => {
    const genVisibleArr = new Promise((resolve, reject) => {
      const blankQuery = state.searchQuery.length === 0 ? true : false;
      if (state.stations.length < 1){
        reject(null);
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
      resolve(stationCopy)
    })

    genVisibleArr.then( (visibleArr) =>
      { 
        if (visibleArr){
          console.log(`VisibleArr: ${JSON.stringify(visibleArr)}`)
            dispatch({
              type: UPDATE_SEARCH,
              payload: {
                stations: visibleArr
              }
            })
        }
      }
    )
    
  }, [state.searchQuery, state.stations]);

  /* Start Effect: Animate Options Icon 
  Starts an animation for the options icon. Which animation depends on the current options value in state. Said property triggers this */
  useEffect(()=>{
    let options = state.options;
    const icon = document.getElementById("options-icon");
    const panel = document.getElementById("options-panel");
    if (!options) {
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
  /* End Effect: Animate Options Icon
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
            left: 50vw;
            transform: translateX(-50%);
          `}
        >
          <Logo />
          <div>
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
                  onClick={()=> fetchDynamic()}
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
                  onChange={(e) => dispatch({type: UPDATE_QUERY, payload: {searchQuery: e.target.value}})}
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
              .filterElecDockOn section.dockOff {
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
              {state.stations && state.stations.map((station) => (
                <Station key={station.station_id} data={station} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}