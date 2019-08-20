import os  # NOQA: E402

import warnings  # NOQA: E402
warnings.filterwarnings('ignore')  # NOQA: E402

import tensorflow as tf  # NOQA: E402

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # NOQA: E402
tf.compat.v1.logging.set_verbosity(tf.compat.v1.logging.ERROR)  # NOQA: E402

import sys
import gym
import gym_knocket
import random
import numpy as np
import pymongo
from pymongo import MongoClient
from keras.models import Sequential
from keras.layers import Dense
from keras.optimizers import Adam
from keras.models import load_model
from random import sample
from .encoder import Encoder
import time
import json


class Basic:
    def __init__(self, model_name):
        self.input_length = Encoder.encoded_state_length  # 390
        self.output_length = len(Encoder.actions)  # 7
        self.encoder = Encoder()
        self.learning_rate = 0.01
        self.model_name = model_name
        self.model_base_path = './models/basic_models/'
        self.model_path = os.path.join(
            self.model_base_path, self.model_name + '.h5')
        self.training_data = None
        self.test_data = None
        self.model = None

    def build_model(self):
        self.model = Sequential()
        self.model.add(
            Dense(128, input_dim=self.input_length, activation='relu'))
        self.model.add(Dense(48, activation="relu"))
        self.model.add(Dense(24, activation="relu"))
        self.model.add(Dense(self.output_length, activation='softmax'))
        self.model.compile(loss='categorical_crossentropy',
                           optimizer=Adam(lr=self.learning_rate))
        return self.model

    def load_training_data(self):
        training_json = os.path.join(self.model_base_path, 'training.json')
        if os.path.exists(training_json):
            with open(training_json) as json_file:
                raw = json.load(json_file)
                encoded_list = np.array(raw)
        else:
            client = MongoClient('localhost', 27017)
            db = client.knocket
            records = list(db.training.find())
            client.close()
            random.seed(101478)
            random.shuffle(records)
            encoded_list = [[self.encoder.encode_state(
                r.get("sensorData", {})).tolist(), self.encoder.encode_move(r.get("move", {}))] for r in records]
            with open(training_json, 'w') as outfile:
                json.dump(encoded_list, outfile)
        test_index = int(len(encoded_list) * .01)
        self.test_data = encoded_list[0:test_index]
        self.training_data = encoded_list[test_index:len(encoded_list)]

    def train_model(self):
        self.build_model()
        X = np.array([i[0] for i in self.training_data]
                     ).reshape(-1, len(self.training_data[0][0]))
        y = np.array([i[1] for i in self.training_data]
                     ).reshape(-1, len(self.training_data[0][1]))

        self.model.fit(X, y, epochs=10, batch_size=256)

    def evaluate(self):
        X = np.array([i[0] for i in self.test_data]
                     ).reshape(-1, len(self.test_data[0][0]))
        y = np.array([i[1] for i in self.test_data]
                     ).reshape(-1, len(self.test_data[0][1]))
        return self.model.evaluate(X, y)

    def train(self):
        start = time.time()
        self.load_training_data()
        end = time.time()
        print('Loading Elapsed Time:', end - start)

        start = time.time()
        self.train_model()
        end = time.time()
        print('Training Elapsed Time:', end - start)

        print('Saving ', self.model_path)
        self.model.save(self.model_path)

        start = time.time()
        loss = self.evaluate()
        end = time.time()
        print('Model Loss: ', loss)
        print('Evaluation Elapsed Time:', end - start)

    def load_or_train_model(self):
        if os.path.exists(self.model_path):
            self.model = load_model(self.model_path)
        else:
            self.train()

    def trial(self, env):
        self.load_or_train_model()
        scores = []
        wins = 0
        for _ in range(100):
            score = 0
            done = False
            state = env.reset()
            prev_obs = self.encoder.encode_state(state)
            winner = False

            while not done:
                prediction = self.model.predict(
                    prev_obs.reshape(-1, len(prev_obs)))[0]
                action = self.encoder.actions[np.argmax(prediction)]

                state, reward, done, _ = env.step(action)
                prev_obs = self.encoder.encode_state(state)
                score += reward

                if done:
                    if state["outcome"] == "winner":
                        winner = True
                        wins += 1

            scores.append(score)
            print("Score: ", score, "Won: ", winner)

        print('Average Score:', sum(scores) / len(scores))
        print("Win Pct: ", wins/100)


def main():
    model_name = sys.argv[1] if len(sys.argv) > 1 else "basic"
    basic_agent = Basic(model_name)
    env = gym.make("kkt-v1")
    basic_agent.trial(env)


if __name__ == "__main__":
    main()
