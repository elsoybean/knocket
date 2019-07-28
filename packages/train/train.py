import sys
import json
import os
import gym
import gym_knocket
from random import sample


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


env = gym.make('kkt-v1')
state = env.reset()
done = False
while not done:
    state, reward, done, debug = env.step(sample(env.action_space, 1))
