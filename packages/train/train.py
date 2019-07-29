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

env = gym.make('kkt-v1')


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


def encode_action(action):
    output = []
    for a in env.action_space:
        if a == action:
            output.append(1)
        else:
            output.append(0)
    return output


def generate_training_data():
    training_data = []
    accepted_scores = []

    for game_index in range(10000):
        state = env.reset()
        done = False
        previous_state = {}
        game_memory = []
        score = 0
        steps = 0
        first = True

        while not done:
            action = sample(env.action_space, 1)[0]
            state, reward, done, debug = env.step(action)

            if not first:
                game_memory.append([previous_state, action])

            previous_state = state
            first = False

            score += reward
            steps += 1

        if score > 1:
            print("Finished game ", game_index,
                  ", score: ", score, ", steps: ", steps)
            accepted_scores.append(score)
            for data in game_memory:
                training_data.append(
                    [encode_sensor_data(data[0]).tolist(), encode_action(data[1])])

    training_data_file = open('train.json', 'w')
    print(json.dumps(training_data), file=training_data_file)
    return training_data


def build_model(input_size, output_size):
    model = Sequential()
    model.add(Dense(128, input_dim=input_size, activation='relu'))
    model.add(Dense(52, activation='relu'))
    model.add(Dense(output_size, activation='linear'))
    model.compile(loss='mse', optimizer=Adam())
    return model


def train_model(training_data):
    X = np.array([i[0] for i in training_data]
                 ).reshape(-1, len(training_data[0][0]))
    y = np.array([i[1] for i in training_data]
                 ).reshape(-1, len(training_data[0][1]))
    model = build_model(input_size=len(X[0]), output_size=len(y[0]))

    model.fit(X, y, epochs=10)
    return model


def train():
    training_data = []

    if path.exists('train.json'):
        with open('train.json', 'r') as training_data_file:
            training_data = json.load(training_data_file)
    else:
        training_data = generate_training_data()

    trained_model = train_model(training_data)

    # serialize model to JSON
    model_json = trained_model.to_json()
    with open("model.json", "w") as json_file:
        json_file.write(model_json)
    # serialize weights to HDF5
    trained_model.save_weights("model.h5")

    return trained_model


def load_or_train_model():
    if path.exists('model.json') and path.exists('model.h5'):
        json_file = open('model.json', 'r')
        loaded_model_json = json_file.read()
        json_file.close()
        trained_model = model_from_json(loaded_model_json)
        # load weights into new model
        trained_model.load_weights("model.h5")
    else:
        trained_model = train()

    return trained_model


trained_model = load_or_train_model()

scores = []
wins = 0
for each_game in range(100):
    score = 0
    done = False
    state = env.reset()
    prev_obs = encode_sensor_data(state)
    winner = False

    while not done:
        action = env.action_space[np.argmax(trained_model.predict(
            prev_obs.reshape(-1, len(prev_obs)))[0])]
        state, reward, done, info = env.step(action)
        prev_obs = encode_sensor_data(state)
        score += reward

        if done:
            if state["outcome"] == "winner":
                winner = True
                wins += 1

    scores.append(score)
    print("Score: ", score, "Won: ", winner)

print('Average Score:', sum(scores) / len(scores))
print("Win Pct: ", wins/100)
