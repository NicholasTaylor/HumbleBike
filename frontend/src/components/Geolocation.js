const Geolocation = () => {
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
}

export default Geolocation;