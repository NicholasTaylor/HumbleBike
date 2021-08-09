class Station:
    def __init__(self, station_id, station_status, is_installed, is_renting, is_returning, num_bikes_available, num_ebikes_available, num_bikes_disabled, num_docks_disabled, lat, lon, region_id, electric_bike_surcharge_waiver):
        self.station_id = station_id
        self.station_status = station_status
        self.is_installed = is_installed
        self.is_renting = is_renting
        self.is_returning = is_returning
        self.num_bikes_available = num_bikes_available
        self.num_ebikes_available = num_ebikes_available
        self.num_bikes_disabled = num_bikes_disabled
        self.num_docks_disabled = num_docks_disabled
        self.lat = lat
        self.lon = lon
        self.region_id = region_id
        self.electric_bike_surcharge_waiver = electric_bike_surcharge_waiver

class DataPull:
    def __init__(self, info, status):
        self.info = info
        self.status = status
    def generate_station(self):
        station_dict = dict(self.info)
        station_dict.update(self.status)

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
        self.eightd_has_key_dispenser = eightd_has_key_dispenser
        self.region_id = region_id
        self.capacity = capacity
        self.rental_methods = rental_methods
        self.electric_bike_surcharge_waiver = electric_bike_surcharge_waiver
        self.legacy_id = legacy_id
        self.station_type = station_type
        self.external_id = external_id
        self.has_kiosk = has_kiosk
        self.eightd_station_services = eightd_station_services
        self.rental_uris = rental_uris