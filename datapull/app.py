from numpy import array, savez_compressed, load
import json

def sort_key(e):
        return e[0]

def sort_station_id(e):
    for ele in e:
        if ele[0] == 'station_id':
            return int(ele[1])

def get_json(info_url, status_url):
    import requests
    from datetime import datetime

    station_map = {}
    station_arr = []
    r_info = requests.get(info_url).json()['data']['stations']
    r_status = requests.get(status_url).json()['data']['stations']

    for station in r_info:
        station_map[station['station_id']] = station
    for station in r_status:
        full_station = station_map[station['station_id']]
        full_station.update(station)
        full_station_arr = list(full_station.items())
        full_station_arr.sort(key=sort_key)
        station_arr.append(full_station_arr)
    station_arr.sort(key=sort_station_id)
    current = datetime.now()
    date = current.strftime('%Y-%m-%d %H:%M:%S')
    month = current.strftime('%m')
    day = current.strftime('%d')
    week = current.strftime('%U')
    hour = current.strftime('%H')
    minute = current.strftime('%M')
    full_record = {
        'date': date,
        'month': month,
        'day': day,
        'weeknum': week,
        'hour': hour,
        'minute': minute,
        'stations': station_arr
    }
    full_record_arr = list(full_record.items())
    return full_record_arr

def testing_view(filename):
    dict_data = load(filename, allow_pickle=True)
    data = dict_data['arr_0']
    return data[0]

#stations = get_json('https://gbfs.citibikenyc.com/gbfs/en/station_information.json','https://gbfs.citibikenyc.com/gbfs/en/station_status.json')
#data = array(stations, dtype=object)
#savez_compressed('data.npz', data)
print(testing_view('data.npz'))