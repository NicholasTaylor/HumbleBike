export default function GetStationInfo (ENDPOINT) {
  return fetch(ENDPOINT)
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
}