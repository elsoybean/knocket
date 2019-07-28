import sys
import json


def transform_sensor_data(data):
    output = []
    output.append(data["proximity"][0]["type"] == "bot")
    output.append(data["proximity"][0]["type"] == "wall")
    output.append(data["proximity"][0]["type"] == "none")
    output.append(data["damage"] == "none")
    output.append(data["damage"] == "minor")
    output.append(data["damage"] == "major")
    output.append(any(dmg["dealt"] for dmg in data["damages"]))
    output.append(any(not dmg["dealt"] for dmg in data["damages"]))
    return output


def calculate_score(data):
    score = 0
    for dmg in data["damages"]:
        if dmg["dealt"]:
            score = score + 2
        else:
            score = score - 1

    return score


while 1:
    try:
        input_string = input()

    except:
        break

    if not input_string:
        break

    data = json.loads(input_string)
    score = calculate_score(data)
    print("Scored: ", score, file=sys.stderr)

    input_data = transform_sensor_data(data)
    print("attack")
