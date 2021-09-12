const rawLocation = {};
const rawStation = {};
const rawInfo = {};

const navLocation = (input) => {
  return navigator.geolocation.getCurrentPosition(
    (position) => {
      const output = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        isLocation: true
      }
      Object.assign(input, output);
      return input;
    },
    () => {
      const output = {
        lat: 0,
        lon: 0,
        isLocation: false
      }
      Object.assign(input, output);
      return input;
    }
  )
}

const getStation = (input) => {
  return fetch('https://gbfs.citibikenyc.com/gbfs/en/station_status.json')
    .then((response) => response.json())
    .then((json) => {
      Object.assign(input, json);
      return input;
    })
}

const getInfo = (input) => {
  return fetch('https://gbfs.citibikenyc.com/gbfs/en/station_information.json')
    .then((response) => response.json())
    .then((json) => {
      Object.assign(input, json);
      return input;
    })
}

const getLocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  })
}

export default async function GetBikeData() {
  getLocation()
    .then(
      (location) => {
        return {
          payload: {
            location: {
              lat: location ? location.coords.latitude : 0,
              lon: location ? location.coords.longitude : 0,
              isLocation: location ? true : false
            },
            stations: getStation()
          }
        }
      }
    );
}
