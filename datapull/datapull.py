import json, records_pb2, os, gzip, requests
from datetime import datetime

STATION_INFORMATION = 'https://gbfs.citibikenyc.com/gbfs/en/station_information.json'
STATION_STATUS = 'https://gbfs.citibikenyc.com/gbfs/en/station_status.json'
FILE_STEM = 'records'
FILE_PREFIX = FILE_STEM + '_'
FILE_DIGITS_LEN = 4
FILE_DIGITS_LEN_STR = '0' +str(FILE_DIGITS_LEN)
FILE_EXT = '.tar.gz'
FILE_ZERO = FILE_PREFIX + '0000' + FILE_EXT
FILE_SETTINGS = 'settings.json'
GIGABYTE = 1073741824
FILE_LIMIT = 18874368
LOG_FILE = 'log.csv'
LOG_FIELD_1 = 'time'
LOG_FIELD_2 = 'duration'
LOG_FIELD_3 = 'filesize'
WEATHER_PREFIX = 'https://api.weather.gov/stations/'
WEATHER_STATION = 'KNYC'
WEATHER_SUFFIX = '/observations/latest'
WEATHER_LATEST = WEATHER_PREFIX +WEATHER_STATION +WEATHER_SUFFIX

def round_metrics_to_two(value):
    try:
        return round(value,2)
    except:
        return None

def gen_weather_data():
    r = requests.get(WEATHER_LATEST)
    r_json = r.json()
    weather = r_json['properties']
    output = {
        'temperature': round_metrics_to_two(weather['temperature']['value']),
        'wind_speed': round_metrics_to_two(weather['windSpeed']['value']),
        'wind_direction': weather['windDirection']['value'],
        'relative_humidity': round_metrics_to_two(weather['relativeHumidity']['value']),
        'conditions': weather['textDescription']
    }
    return output

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
        attr_value = station[attr] if station[attr] is not None else 'N/A'
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
            try:
                setattr(inst, attr, attr_value)
            except:
                pass


def get_json(info_url, status_url):
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
    stations_data = get_json(STATION_INFORMATION,STATION_STATUS)
    weather_data = gen_weather_data()
    gen_stations(record.stations,stations_data)
    gen_station(record.weather,weather_data)
    record.date.FromSeconds(int(time.mktime(datetime.now().timetuple())))

def find_start_page_no_settings():
	files = os.listdir('.')
	records = []
	for file in files:
		prefix_len = len(FILE_PREFIX)
		ext_len = len(FILE_EXT)
		num_start = prefix_len
		num_end = num_start + FILE_DIGITS_LEN
		num_candidate = file[num_start:num_end]
		try:
			is_num_test = int(num_candidate)
			is_num = True
		except:
			is_num = False
		if file[0:prefix_len] == FILE_PREFIX and file[-ext_len:] == FILE_EXT and is_num:
			records.append(int(num_candidate))
	return max(records)

def find_start_page():
    if os.path.exists(FILE_SETTINGS):
        try:
            with open(FILE_SETTINGS) as f:
                settings_dict = json.loads(f.read())
                last_page = settings_dict['last_page']
        except:
            last_page = False
    else:
        try:
            last_page = find_start_page_no_settings()
        except:
            last_page = False
    if isinstance(last_page, int):
        return last_page
    else:
        return 0

def find_latest_file(current_page):
    found_file = False
    need_new_file = False
    filename = ''
    while found_file == False:
        fn_test = FILE_PREFIX + f'{current_page:{FILE_DIGITS_LEN_STR}}' + FILE_EXT
        fn_exist = True if os.path.exists(fn_test) else False
        fn_right_size = True if fn_exist and os.path.getsize(fn_test) < FILE_LIMIT else False
        if fn_exist == False:
            filename = fn_test
            need_new_file = True
            found_file = True
        elif fn_right_size == True:
            filename = fn_test
            need_new_file = False
            found_file = True
        else:
            current_page += 1
    return filename, need_new_file, current_page

def save_records(records, filename):
    with gzip.open(filename, 'wb') as f:
        f.write(records.SerializeToString())

def add_record(start_page):
    filename, need_new_file, current_page = find_latest_file(start_page)
    records = records_pb2.Records()
    if not(need_new_file):
        with gzip.open(filename, 'rb') as f:
            records.ParseFromString(f.read())
    record = records.record.add()
    gen_record(record)
    return records, filename, current_page

def read_record(start_page):
    from google.protobuf.json_format import MessageToJson
    filename, need_new_file, current_page = find_latest_file(start_page)
    records = records_pb2.Records()
    with gzip.open(filename, 'rb') as f:
        records.ParseFromString(f.read())
    data_raw = MessageToJson(records)
    data_json = json.loads(data_raw)
    with open('test.json', 'w+') as f:
        f.write(json.dumps(data_json['record']))
    return('Done')

def log_run(start_time, end_time, filename, current_page):
    import csv
    page_dict = {"last_page": current_page}
    try:
        with open(FILE_SETTINGS, 'r') as f:
            settings_dict = json.loads(f.read())
            old_page = settings_dict['last_page']
    except:
        settings_dict = {}
        old_page = 0
    if old_page != current_page:
        settings_dict.update(page_dict)
        with open(FILE_SETTINGS, 'w+') as f:
            f.write(json.dumps(settings_dict))
    else:
        pass
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
    start_page = find_start_page()
    records, filename, current_page = add_record(start_page)
    save_records(records, filename)
    end_time = datetime.now()
    run_data = log_run(start_time, end_time, filename, current_page)
    filesize_gb = '{:.2f}'.format(run_data[LOG_FIELD_3] / GIGABYTE) if run_data[LOG_FIELD_3] > GIGABYTE/100 else '< 0.01'
    return 'Process completed at ' +end_time.strftime('%Y-%m-%d %H:%M:%S') +' in ' +str(run_data[LOG_FIELD_2]) +'ms. File ' +filename +' is now ' +filesize_gb +'GB.'

print(datapull())
#print(read_record(find_start_page()))