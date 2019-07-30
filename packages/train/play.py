import sys
import json
import os
import gym
import gym_knocket
import random
import numpy as np
from keras.models import Sequential
from keras.layers import Dense
from keras.optimizers import Adam
from keras.models import model_from_json
from random import sample
import os.path
from os import path

actions = ["ahead", "wait", "attack", "rotatecw", "rotateccw"]
print(os.getcwd(), file=sys.stderr)


def encode_sensor_data(data):
    output = []
    output.append(1 if data["proximity"][0]["type"] == "bot" else 0)
    output.append(1 if data["proximity"][0]["type"] == "wall" else 0)
    output.append(1 if data["proximity"][0]["type"] == "none" else 0)
    output.append(1 if data["damage"] == "none" else 0)
    output.append(1 if data["damage"] == "minor" else 0)
    output.append(1 if data["damage"] == "major" else 0)
    output.append(1 if any(dmg["dealt"] for dmg in data["damages"]) else 0)
    output.append(1 if any(not dmg["dealt"] for dmg in data["damages"]) else 0)
    return np.array(output)


json_file = open('../../model.json', 'r')
loaded_model_json = json_file.read()
json_file.close()
trained_model = model_from_json(loaded_model_json)
# load weights into new model
trained_model.load_weights("../../model.h5")

done = False
while not done:
    try:
        line = sys.stdin.readline()
    except:
        done = True

    if not line:
        done = True

    data = json.loads(line)
    state = encode_sensor_data(data)
    action = actions[np.argmax(trained_model.predict(
        state.reshape(-1, len(state)))[0])]
    print(action)
    sys.stdout.flush()
