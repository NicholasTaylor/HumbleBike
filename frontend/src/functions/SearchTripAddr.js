import { useContext } from "react";
import StoreContext from "../Store";
import { UPDATE_VALUE } from "../constants/action-types";

const SearchTripAddr = () => {
    const [state, dispatch] = useContext(StoreContext);
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

  export default SearchTripAddr;