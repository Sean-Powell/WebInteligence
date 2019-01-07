import ParseFile
import json


def _run():
    docs = ParseFile.parseFile("C:/Users/seanp/PycharmProjects/WebIntelligence/data.xml")
    with open('data.json', 'w') as outfile:
        json.dump([doc.__dict__ for doc in docs], outfile)
    json_string = json.dumps([doc.__dict__ for doc in docs])
    print(json_string)
    return json_string


json_data = _run()
