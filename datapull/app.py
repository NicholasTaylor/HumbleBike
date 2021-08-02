def getJson():
    import requests
    id_list = []
    r_info = requests.get('https://gbfs.citibikenyc.com/gbfs/en/station_information.json').json()['data']['stations']
    r_status = requests.get('https://gbfs.citibikenyc.com/gbfs/en/station_status.json').json()
    for station in r_info:
        id_list.append(station['station_id'])
    return id_list

print(getJson())