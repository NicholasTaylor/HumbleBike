import json, records_pb2, os, gzip
from datetime import datetime

STATION_INFORMATION = 'https://gbfs.citibikenyc.com/gbfs/en/station_information.json'
STATION_STATUS = 'https://gbfs.citibikenyc.com/gbfs/en/station_status.json'
FILE_STEM = 'records'
FILE_PREFIX = FILE_STEM + '_'
FILE_EXT = '.tar.gz'
FILE_ZERO = FILE_PREFIX + '0000' + FILE_EXT
GIGABYTE = 1073741824
LOG_FILE = 'log.csv'
LOG_FIELD_1 = 'time'
LOG_FIELD_2 = 'duration'
LOG_FIELD_3 = 'filesize'

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

def gen_record(record):
    import time
    json_out = get_json(STATION_INFORMATION,STATION_STATUS)
    gen_stations(record.stations,json_out)
    record.date.FromSeconds(int(time.mktime(datetime.now().timetuple())))

def find_latest_file():
    counter = 0
    found_file = False
    need_new_file = False
    filename = ''
    while found_file == False:
        fn_test = FILE_PREFIX + f'{counter:04}' + FILE_EXT
        fn_exist = True if os.path.exists(fn_test) else False
        fn_right_size = True if fn_exist and os.path.getsize(fn_test) < GIGABYTE else False
        if fn_exist == False:
            filename = fn_test
            need_new_file = True
            found_file = True
        elif fn_right_size == True:
            filename = fn_test
            need_new_file = False
            found_file = True
        else:
            counter += 1
    return filename, need_new_file

def save_records(records, filename):
    with gzip.open(filename, 'wb') as f:
        f.write(records.SerializeToString())

def add_record():
    filename, need_new_file = find_latest_file()
    records = records_pb2.Records()
    if not(need_new_file):
        with gzip.open(filename, 'rb') as f:
            records.ParseFromString(f.read())
    record = records.record.add()
    gen_record(record)
    return records, filename

def read_record():
    from google.protobuf.json_format import MessageToJson
    filename, need_new_file = find_latest_file()
    records = records_pb2.Records()
    with gzip.open(filename, 'rb') as f:
        records.ParseFromString(f.read())
    data_raw = MessageToJson(records)
    data_json = json.loads(data_raw)
    with open('test.json', 'w+') as f:
        f.write(json.dumps(str(data_json['record'])))
    return('Done')

def log_run(start_time, end_time, filename):
    import csv
    is_log = True if os.path.exists(LOG_FILE) else False
    diff = end_time - start_time
    duration = int(round((diff.seconds * 1000) + (diff.microseconds / 1000),0))
    filesize = os.path.getsize(filename)
    new_row = {LOG_FIELD_1: start_time, LOG_FIELD_2: duration, LOG_FIELD_3: filesize}
    with open(LOG_FILE, 'a+') as f:
        logwriter = csv.DictWriter(f, fieldnames=[LOG_FIELD_1, LOG_FIELD_2, LOG_FIELD_3])
        if not(is_log):
            logwriter.writeheader()
        else:
            pass
        logwriter.writerow(new_row)
    return new_row

def datapull():
    start_time = datetime.now()
    records, filename = add_record()
    save_records(records, filename)
    end_time = datetime.now()
    run_data = log_run(start_time, end_time, filename)
    filesize_gb = '{:.2f}'.format(run_data[LOG_FIELD_3] / GIGABYTE) if run_data[LOG_FIELD_3] > GIGABYTE/100 else '< 0.01'
    return 'Process completed at ' +end_time.strftime('%Y-%m-%d %H:%M:%S') +' in ' +str(run_data[LOG_FIELD_2]) +'ms. File ' +filename +' is now ' +filesize_gb +'GB.'

#print(datapull())
print(read_record())