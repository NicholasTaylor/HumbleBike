import { useEffect, useReducer } from "react";
import _, { filter } from 'lodash';
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
import { UPDATE_STATION_STATUS, GET_STATION_INFO, TOGGLE_FILTER, TOGGLE_OPTIONS } from "./constants/action-types";
import { endpointInfo, endpointStatus } from "./constants/endpoints";

/** @jsxRuntime classic */
/** @jsx jsx */

export default function App() {
  const initialState = {
    stationInfo: {},
    location: {},
    lastUpdated: new Date().toLocaleString(),
    useTripPlanner: false,
    filterElec: false,
    filterElecFree: false,
    filterDock: false,
    error: null
  }

  const reducer = (state, action) => {
    switch (action.type) {
      case TOGGLE_FILTER:
        /*let filterName = action.payload.filterName;
        if (filterName){
          return {
            ...state,
            [filterName] : !(state[filterName])
          }
        }*/
        console.log(`Click ${action.payload}`)
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
  
  const dispViewElems = `${state.useTripPlanner ? `none`: `block`}`;

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

  useEffect(()=>{
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
  },[state.stationInfo])

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
                  onClick={dispatch({
                    type: TOGGLE_OPTIONS
                  })}
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
                    onClick={dispatch({
                      type: TOGGLE_FILTER,
                      payload: `filterElec`
                    })}
                    checked={state.filterElec ? "checked" : ""}
                  />
                </div>
                <div>
                  Docks Only?
                  <input
                    type="checkbox"
                    label="Docks Only?"
                    onClick={dispatch({
                      type: TOGGLE_FILTER,
                      payload: `filterDock`
                    })}
                    checked={state.filterDock ? "checked" : ""}
                  />
                </div>
                <div>
                  Electric with No Classic?
                  <input
                    type="checkbox"
                    label="Electric with No Classic?"
                    onClick={dispatch({
                      type: TOGGLE_FILTER,
                      payload: `filterElecFree`
                    })}
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