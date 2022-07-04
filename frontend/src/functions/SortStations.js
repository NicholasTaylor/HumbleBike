export default function SortStations(stationList,hasLocation) {
    const processedDataSorted = hasLocation ? stationList.sort((a,b) => a.dist > b.dist ? 1 : -1) : stationList.sort((a,b) => a.name > b.name ? 1 : -1);
    return processedDataSorted;
}