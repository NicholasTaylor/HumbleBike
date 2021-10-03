import { useState, useEffect } from 'react';
export default function GetLocation(){
    const [location, setLocation] = useState({});
    const [error, setError] = useState(null);

    const onChange = ({coords}) => {
        setLocation({
            latitude: coords.latitude,
            longitude: coords.longitude
        });
    };

    const onError = (error) => {
        setError(error.message);
    };

    useEffect(() => {
        const nav = navigator.geolocation;
        if (!nav) {
            setError('Location not available.');
            return;
        }
        const update = nav.watchPosition(onChange, onError);
        return () => nav.clearWatch(update);
    },[])
    return {...location, error};
}