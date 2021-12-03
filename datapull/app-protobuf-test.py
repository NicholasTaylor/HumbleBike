import json, records_pb2, google, inspect

def sort_key(e):
        return e[0]

def sort_station_id(e):
    for ele in e:
        if ele[0] == 'station_id':
            return int(ele[1])

def gen_sub_attr(new_inst, attr):
    keys_list = new_inst.DESCRIPTOR.fields_by_name.keys()
    for sub_attr in attr:
        if sub_attr not in keys_list:
            continue
        else:
            setattr(new_inst, sub_attr, attr[sub_attr])
    return new_inst

def gen_station(new_inst, station):
    keys_list = new_inst.DESCRIPTOR.fields_by_name.keys()
    for attr in station:
        if attr not in keys_list:
            continue
        else:
            pass
        #type_test = type(station[attr]).__name__
        attr_value = station[attr]
        if attr == 'eightd_active_station_services' or attr == 'eightd_station_services':
            for service in attr_value:
                new_inst.attr = gen_sub_attr(getattr(getattr(new_inst, attr), 'add')(), service)
        elif attr == 'rental_methods':
            getattr(getattr(new_inst, attr), 'extend')(attr_value)
        elif attr == 'rental_uris' or attr == 'valet':
            pass
        
        #new_inst.attr = station[attr]

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
    return data

#stations = get_json('https://gbfs.citibikenyc.com/gbfs/en/station_information.json','https://gbfs.citibikenyc.com/gbfs/en/station_status.json')
#data = array(stations, dtype=object)
#savez_compressed('data.npz', data)
#print(testing_view('data.npz'))

"""with open('output.json','w+') as f:
    f.write(json.dumps(testing_view('data.npz').tolist()))
"""

attr_values = {'id': 'testing123'}

def attr_method(new_inst, attr):
    for i in attr:
        setattr(new_inst, i, attr[i])
    return new_inst

test = records_pb2.Station()
indirect = 'rental_methods'
getattr(getattr(test, indirect), 'extend')(['TESTTESTTEST'])
print(test.rental_methods)