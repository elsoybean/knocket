import os  # NOQA: E402

import warnings  # NOQA: E402
warnings.filterwarnings('ignore')  # NOQA: E402

import tensorflow as tf  # NOQA: E402

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # NOQA: E402
tf.compat.v1.logging.set_verbosity(tf.compat.v1.logging.ERROR)  # NOQA: E402

import sys
import gym
import gym_knocket
import numpy as np
from numpy.random import choice
import random
import json
from keras.optimizers import Adam
from keras.layers import Dense
from keras.models import Sequential
from keras.models import model_from_json
from collections import deque
from .encoder import Encoder
from .strategy import Random
from .strategy import Weighted
from .strategy import Basic
from .strategy import Attack
from .strategy import Erratic


class DQN:
    def __init__(self, model_name):
        self.input_length = Encoder.encoded_state_length  # 390
        self.output_length = len(Encoder.actions)  # 7
        self.encoder = Encoder()

        self.memory = deque(maxlen=10000)

        self.gamma = 0.999
        self.epsilon = 1.0
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.9997697
        self.learning_rate = 0.01
        self.tau = .125

        self.model = self.create_model()
        print(self.model.summary())

        self.target_model = self.create_model()
        self.model_name = model_name
        self.model_path = None

    def create_model(self):
        model = Sequential()
        model.add(Dense(128, input_dim=self.input_length, activation='relu'))
        model.add(Dense(48, activation="relu"))
        model.add(Dense(24, activation="relu"))
        model.add(Dense(self.output_length, activation='softmax'))
        model.compile(loss='categorical_crossentropy',
                      optimizer=Adam(lr=0.001), metrics=['accuracy'])
        return model

    def default_action(self, state):
        weighted_actions = [6, 1, 1, 2, 2, 0, 0]
        action_ix = choice(range(self.output_length), p=np.array(
            weighted_actions) / sum(weighted_actions))
        return np.eye(self.output_length, dtype=int)[action_ix]

    def act(self, state, strat):
        self.epsilon *= self.epsilon_decay
        self.epsilon = max(self.epsilon_min, self.epsilon)
        if np.random.random_sample() < self.epsilon:
            return strat.act(state)

        encoded_state = self.encoder.encode_state(state).reshape(1, -1)
        prediction = self.model.predict(encoded_state)
        return self.encoder.actions[np.argmax(prediction)]

    def remember(self, state, action, reward, new_state, done):
        encoded_state = self.encoder.encode_state(state).reshape(1, -1)
        encoded_new_state = self.encoder.encode_state(new_state).reshape(1, -1)
        encoded_action = self.encoder.encode_action(action)
        self.memory.append(
            [encoded_state, encoded_action, reward, encoded_new_state, done])

    def replay(self):
        batch_size = 32
        if len(self.memory) < batch_size:
            return

        samples = random.sample(self.memory, batch_size)
        for sample in samples:
            #pylint: disable=W0633
            state, action, reward, new_state, done = sample
            target = self.target_model.predict(state)
            if done:
                target[0][action] = reward
            else:
                Q_future = max(self.target_model.predict(
                    new_state)[0])
                target[0][action] = reward + Q_future * self.gamma
            self.model.fit(state, target, epochs=1, verbose=0)

    def target_train(self):
        weights = self.model.get_weights()
        target_weights = self.target_model.get_weights()
        for i in range(len(target_weights)):
            target_weights[i] = weights[i] * self.tau + \
                target_weights[i] * (1 - self.tau)
        self.target_model.set_weights(target_weights)

    def ensure_model_path(self):
        model_base_path = './models/dqn_models/'
        model_path = os.path.join(model_base_path, self.model_name)
        model_inc = 0
        while os.path.exists(model_path):
            model_inc += 1
            model_path = "{}-{}".format(os.path.join(model_base_path,
                                                     self.model_name), model_inc)

        return model_path

    def save_model(self, fn):
        if self.model_path == None:
            self.model_path = self.ensure_model_path()
            print('Creating ' + self.model_path)
            os.makedirs(self.model_path)

        new_fn = os.path.join(self.model_path, fn)
        print('Saving ' + new_fn)

        self.model.save(new_fn)


def main():
    model_name = sys.argv[1] if len(sys.argv) > 1 else "DQN"
    trials = 10000
    dqn_agent = DQN(model_name)
    strategy_list = [
        Random(),
        Weighted({"attack": 2, "ahead": 3, "wait": 0}),
        Basic(),
        Attack(),
        Erratic(3),
    ]

    env = gym.make("kkt-v1")

    for trial in range(trials):
        cur_state = env.reset()
        total_reward = 0
        done = False
        pct = 0
        steps = 0
        strat = choice(strategy_list)
        print("\n\nTrial {}, Strategy: {}".format(trial, strat.name()))

        while not done:
            if (cur_state['elapsed'] / 2000) > (pct + 1) / 100:
                pct += 1
                sys.stdout.write('.')
                sys.stdout.flush()

            action = dqn_agent.act(cur_state, strat)
            new_state, reward, done, _ = env.step(action)

            # reward = reward if not done else -20
            total_reward += reward
            new_state = new_state
            dqn_agent.remember(cur_state, action, reward, new_state, done)

            dqn_agent.replay()       # internally iterates default (prediction) model
            dqn_agent.target_train()  # iterates target model

            cur_state = new_state
            steps += 1

        print("\nScore: {}, Steps: {}".format(reward, steps))

        if trial % 100 == 0 or reward > 0:
            dqn_agent.save_model("trial-{}.model".format(trial))


if __name__ == "__main__":
    main()
