import gzip, json, os, records_pb2

STATION_INFORMATION = 'https://gbfs.citibikenyc.com/gbfs/en/station_information.json'
STATION_STATUS = 'https://gbfs.citibikenyc.com/gbfs/en/station_status.json'
FILE_STEM = 'records'
FILE_PREFIX = FILE_STEM + '_'
FILE_EXT = '.tar.gz'
FILE_ZERO = FILE_PREFIX + '0000' + FILE_EXT
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

def find_latest_file():
    counter = 0
    found_file = False
    need_new_file = False
    filename = ''
    while found_file == False:
        fn_test = FILE_PREFIX + f'{counter:04}' + FILE_EXT
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
            counter += 1
    return filename, need_new_file

def read_record():
    from google.protobuf.json_format import MessageToJson
    #filename, need_new_file = find_latest_file()
    filename = FILE_PREFIX + '0000' + FILE_EXT
    need_new_file = False
    records = records_pb2.Records()
    print('Decompressing, opening gzip file.')
    with gzip.open(filename, 'rb') as f:
        print('Parsing from gzip file.')
        records.ParseFromString(f.read())
    record_counter = 0
    while record_counter < 3:
        station_counter = 0
        while station_counter < 3:
            print(records.record[record_counter].stations.station[station_counter])
            station_counter += 1
        record_counter += 1
    """while record_counter < 3:
        for record in records.record:
            station_counter = 0
            while station_counter < 3:
                for station in record.stations.station:
                    print('station_counter: %i' % (station_counter))
                    print(station)
                    station_counter += 1
            record_counter += 1"""

    """print('Converting protocol buffer message to JSON.')
    data_raw = MessageToJson(records)
    print('Loading to string.')
    data_json = json.loads(data_raw)
    with open('test.json', 'w+') as f:
        print('Writing to file.')
        f.write(json.dumps(data_json['record']))"""
    return('Done')

print('Testing')
read_record()