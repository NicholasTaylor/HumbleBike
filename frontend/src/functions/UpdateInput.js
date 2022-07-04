import { useContext } from "react";
import StoreContext from "../Store";
import { UPDATE_VALUE } from "../constants/action-types";

const useUpdateInput = (e, doUpdateStation = false) => {
  const [state, dispatch] = useContext(StoreContext);
  const updateQuery = new Promise((resolve) => {
    console.log(`Firing`);
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

export default useUpdateInput;