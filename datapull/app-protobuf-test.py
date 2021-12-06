import json, records_pb2, google, inspect
from json import decoder
from google.protobuf.json_format import MessageToJson

def sort_key(e):
        return e[0]

def sort_station_id(e):
    return int(e['station_id'])

def gen_sub_attr(inst, attr):
    keys_list = inst.DESCRIPTOR.fields_by_name.keys()
    for sub_attr in attr:
        if sub_attr not in keys_list:
            continue
        else:
            setattr(inst, sub_attr, attr[sub_attr])
    return inst

def gen_station(inst, station):
    keys_list = inst.DESCRIPTOR.fields_by_name.keys()
    for attr in station:
        if attr not in keys_list:
            continue
        else:
            pass
        attr_value = station[attr]
        type_test = type(attr_value).__name__
        attr_type_test = type(getattr(inst,attr)).__name__
        try:
            value_dict_test = True if type(attr_value[0]).__name__ == 'dict' else False
        except:
            value_dict_test = False
        if type_test == 'list' and value_dict_test:
            attr_arr = []
            for service in attr_value:
                gen_sub_attr(getattr(getattr(inst, attr),'add')(), service)
            getattr(getattr(inst, attr), 'extend')(attr_arr)
        elif type_test == 'list':
            getattr(getattr(inst, attr), 'extend')(attr_value)
        elif type_test == 'dict':
            gen_sub_attr(getattr(inst, attr), attr_value)
        elif attr_type_test == 'Timestamp':
            getattr(getattr(inst, attr), 'FromSeconds')(int(attr_value))
        else:
            setattr(inst, attr, attr_value)


        """if attr == 'eightd_active_station_services' or attr == 'eightd_station_services':
            for service in attr_value:
                new_inst.attr = gen_sub_attr(getattr(getattr(new_inst, attr), 'add')(), service)
        elif attr == 'rental_methods':
            getattr(getattr(new_inst, attr), 'extend')(attr_value)
        elif attr == 'rental_uris' or attr == 'valet':
            gen_sub_attr(getattr(getattr(new_inst, attr), 'add')(), attr_value)
        else:
            setattr(new_inst, attr, attr_value)"""
        
        #new_inst.attr = station[attr]

def get_json(info_url, status_url):
    import requests
    station_map = {}
    station_arr = []
    r_info = requests.get(info_url).json()['data']['stations']
    r_status = requests.get(status_url).json()['data']['stations']

    for station in r_info:
        station_map[station['station_id']] = station
    for station in r_status:
        full_station = station_map[station['station_id']]
        full_station.update(station)
        station_arr.append(full_station)
    station_arr.sort(key=sort_station_id)
    return station_arr

def gen_stations(inst, station_arr):
    for station in station_arr:
        gen_station(inst.station.add(),station)
    return inst

def gen_record(station_arr):
    from datetime import datetime
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


attr_values = {'id': 'testing123'}

def attr_method(new_inst, attr):
    for i in attr:
        setattr(new_inst, i, attr[i])
    return new_inst

test = records_pb2.Station()
indirect = 'last_reported'
#getattr(getattr(test, indirect), 'extend')(['TESTTESTTEST'])
print(dir(test.last_reported))
test.last_reported.FromSeconds(int('1638808954'))
print(test.last_reported.ToJsonString())
"""

json_out = get_json('https://gbfs.citibikenyc.com/gbfs/en/station_information.json','https://gbfs.citibikenyc.com/gbfs/en/station_status.json')
all_stations = gen_stations(records_pb2.Stations(),json_out)
test = json.loads(MessageToJson(all_stations))['station']
print(test[71])