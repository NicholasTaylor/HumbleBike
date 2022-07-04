export default function FetchData (ENDPOINT) {
  return fetch(ENDPOINT)
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
}