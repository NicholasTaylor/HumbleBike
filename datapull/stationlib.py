class Status:
    def __init__(self, legacy_id, station_status, is_renting, is_returning, num_ebikes_available, num_bikes_disabled, eightd_has_available_keys, last_reported, num_bikes_available, num_docks_disabled, is_installed, station_id, num_docks_available):
        self.id = station_id
        self.status = station_status
        self.is_installed = is_installed
        self.is_renting = is_renting
        self.is_returning = is_returning
        self.bikes = num_bikes_available
        self.ebikes = num_ebikes_available
        self.docks = num_docks_available
        self.last_reported = last_reported
        self.legacy_id = legacy_id
        self.bikes_disabled = num_bikes_disabled
        self.docks_disabled = num_docks_disabled
        self.is_available_keys = eightd_has_available_keys

class Info:
    def __init__(self, short_name, eightd_has_key_dispenser, region_id, capacity, rental_methods, electric_bike_surcharge_waiver, station_id, legacy_id, station_type, lat, external_id, lon, has_kiosk, eightd_station_services, name, rental_uris):
        self.id = station_id
        self.name = name
        self.name_short = short_name
        self.lat = lat
        self.lon = lon
        