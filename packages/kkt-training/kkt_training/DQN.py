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
import signal
from collections import Counter
from collections import deque
from keras.optimizers import Adam
from keras.layers import Dense
from keras.models import Sequential
from keras.models import load_model
from .encoder import Encoder
from .strategy import Random
from .strategy import Weighted
from .strategy import Explorer
from .strategy import Attack
from .strategy import Erratic
from .strategy import Hunter


class DQN:
    def __init__(self, model_name):
        avg_steps = 260
        self.input_length = Encoder.encoded_state_length  # 390
        self.output_length = len(Encoder.actions)  # 7
        self.encoder = Encoder()

        self.memory = deque(maxlen=10000000)

        # Move at step 1 should be worth about 1% of a reward at end of trial
        self.gamma = 0.01 ** (1 / avg_steps)
        self.epsilon = 1.0
        self.epsilon_min = 0.01
        # reach 0.5 after ~2,000 trials
        self.epsilon_decay = 0.5 ** (1 / (2000 * avg_steps))
        # don't start decreasing epsilon until ~100 trials have passed
        self.epsilon_decay_delay = 100 * avg_steps

        self.learning_rate = 0.001
        self.batch_size = 32

        self.steps = 0
        self.tau = 0.125

        # Target remembering about 3 zero reward steps for every reward step
        self.bias_against_zero_reward = 1 - (0.007518691 * 3)

        # warm up for ~20 trials before we attempt to train at all
        self.min_memory_length = 20 * \
            (1 - self.bias_against_zero_reward) * avg_steps

        self.model_name = model_name
        self.model_base_path = './models/dqn_models/'
        self.model_path = None

        self.load_or_create_model()

    def load_or_create_model(self):
        self.model_path = os.path.join(self.model_base_path, self.model_name)
        final_model = os.path.join(self.model_path, "final.model")
        if not os.path.exists(final_model):
            if not os.path.exists(self.model_path):
                print('Creating ' + self.model_path)
                os.makedirs(self.model_path)
            self.model = self.create_model()
            self.target_model = self.create_model()
        else:
            self.load_last_model(final_model)

    def load_last_model(self, final_model):
        final_target = os.path.join(self.model_path, "final_target.model")
        model_inc = 0
        checkpoint = os.path.join(
            self.model_path, "checkpoint_{}.model".format(model_inc))
        while os.path.exists(checkpoint):
            model_inc += 1
            checkpoint = os.path.join(
                self.model_path, "checkpoint_{}.model".format(model_inc))
        self.model = load_model(final_model)
        self.target_model = load_model(final_target)
        os.rename(final_model, checkpoint)
        os.rename(final_target, os.path.join(
            self.model_path, "checkpoint_{}_target.model".format(model_inc)))

    def create_model(self):
        model = Sequential()
        model.add(Dense(128, input_dim=self.input_length, activation='relu'))
        model.add(Dense(48, activation="relu"))
        model.add(Dense(24, activation="relu"))
        model.add(Dense(self.output_length, activation='softmax'))
        model.compile(loss='categorical_crossentropy',
                      optimizer=Adam(lr=self.learning_rate))
        return model

    def act(self, state, strat):
        self.steps += 1
        if self.steps > self.epsilon_decay_delay:
            self.epsilon *= self.epsilon_decay
        self.epsilon = max(self.epsilon_min, self.epsilon)
        if np.random.random_sample() < self.epsilon:
            return strat.act(state)
        else:
            return self.predict(state)

    def predict(self, state):
        encoded_state = self.encoder.encode_state(state).reshape(1, -1)
        prediction = self.model.predict(encoded_state)
        return choice(self.encoder.actions, p=prediction[0])

    def remember(self, state, action, reward, new_state, done):
        # Discard most zero reward steps
        if reward == 0 and np.random.random_sample() < self.bias_against_zero_reward:
            return

        encoded_state = self.encoder.encode_state(state).reshape(1, -1)
        encoded_new_state = self.encoder.encode_state(new_state).reshape(1, -1)
        encoded_action = self.encoder.actions.index(action)
        self.memory.append(
            [encoded_state, encoded_action, reward, encoded_new_state, done])

    def replay(self):
        if len(self.memory) < self.batch_size or self.steps < self.min_memory_length:
            return

        batch_x = np.empty((0, 430), float)
        batch_y = np.empty((0, 7), float)
        samples = random.sample(self.memory, self.batch_size)
        for sample in samples:
            #pylint: disable=W0633
            state, action, reward, new_state, done = sample
            batch_x = np.vstack((batch_x, state[0]))
            target = self.target_model.predict(state)
            if done:
                target[0][action] = reward
            else:
                Q_future = max(self.target_model.predict(
                    new_state)[0])
                target[0][action] = reward + Q_future * self.gamma
            batch_y = np.vstack((batch_y, target[0]))

        return self.model.train_on_batch(batch_x, batch_y)

    def target_train(self):
        weights = self.model.get_weights()
        target_weights = self.target_model.get_weights()
        for i in range(len(target_weights)):
            target_weights[i] = weights[i] * self.tau + \
                target_weights[i] * (1 - self.tau)
        self.target_model.set_weights(target_weights)

    def ensure_model_path(self):
        model_path = os.path.join(self.model_base_path, self.model_name)
        model_inc = 0
        while os.path.exists(model_path):
            model_inc += 1
            model_path = "{}_{}".format(os.path.join(self.model_base_path,
                                                     self.model_name), model_inc)

        return model_path

    def save_model(self, fn):
        if self.model_path == None:
            self.model_path = self.ensure_model_path()
            print('Creating ' + self.model_path)
            os.makedirs(self.model_path)

        new_fn = os.path.join(self.model_path, fn)
        print('Saving ' + new_fn + ".model")

        self.model.save(new_fn + ".model")
        self.target_model.save(new_fn + "_target.model")


def main():
    model_name = sys.argv[1] if len(sys.argv) > 1 else "DQN"
    num_steps = np.array([])
    step_rewards = np.array([])
    dqn_agent = DQN(model_name)
    env = gym.make("kkt-v1")

    def train_end():
        print("\n\n\n===============================================\nTrials: {}".format(
            len(num_steps)))
        avg_s = np.mean(num_steps)
        print("Average Number of Steps: {:0.2f}".format(avg_s))
        print("Number of steps distribution \n\t10%: {:0.2f} \t25%: {:0.2f} \t50%: {:0.2f} \t75%: {:0.2f} \t99%: {:0.2f}".format(
            *np.percentile(num_steps, [10, 25, 50, 75, 99])))
        print("Distribution of rewards: {}".format(Counter(step_rewards)))
        dqn_agent.save_model("final")

    def signal_handler(sig, frame):
        train_end()
        sys.exit(0)

    def trial_game():
        state = env.reset()
        total_reward = 0
        done = False
        while not done:
            action = dqn_agent.predict(state)
            state, reward, done, _ = env.step(action)
            total_reward += reward
        return total_reward

    def test():
        results = np.array([])
        wins = 0
        for _ in range(100):
            r = trial_game()
            results = np.append(results, r)
            won = r > 0
            if won:
                wins += 1
            sys.stdout.write('W' if won else 'L')
            sys.stdout.flush()

        losses = len(results) - wins
        print("\nAvg: {:0.2f}, W: {}, L: {}, Pct: {:0.2f}".format(
            np.mean(results), wins, losses, wins/(wins+losses)))

    signal.signal(signal.SIGINT, signal_handler)

    strategy_list = [
        Random(),
        Weighted({"attack": 2, "ahead": 4, "wait": 0}),
        Erratic(3),
        Explorer(),
        Explorer(),
        Explorer(),
        Hunter(),
        Hunter(),
        Hunter(),
    ]

    trial = 0
    msg = ""
    while True:
        trial += 1
        verbose = False  # trial != 0 and trial % 100 == 0
        # if not verbose and trial % 1 == 0:
        #     sys.stdout.write('.')
        #     sys.stdout.flush()
        cur_state = env.reset()
        total_reward = 0
        done = False
        # pct = 0
        steps = 0
        strat = choice(strategy_list)
        if verbose:
            print("\n\nTrial {}, Strategy: {}, Epsilon: {}".format(
                trial, strat.name(), dqn_agent.epsilon))

        while not done:
            # if not verbose:
            #     if (cur_state['elapsed'] / 2000) > (pct + 1) / 100:
            #         pct += 1
            #         sys.stdout.write('.')
            #         sys.stdout.flush()

            action = dqn_agent.act(cur_state, strat)
            new_state, reward, done, _ = env.step(action)
            total_reward += reward
            dqn_agent.remember(cur_state, action, reward, new_state, done)

            # internally iterates default (prediction) model
            loss = dqn_agent.replay()
            if verbose and loss is not None:
                print(
                    " - Step {}, Reward: {}, Loss: {:0.2f}".format(steps, reward, loss))
            dqn_agent.target_train()  # iterates target model

            cur_state = new_state
            step_rewards = np.append(step_rewards, reward)
            steps += 1

        num_steps = np.append(num_steps, steps)
        if verbose:
            print("Score: {}, Steps: {}".format(reward, steps))

        if trial % 250 == 0 and trial >= 200:
            print("\nLast Loss: ", loss)
            print("Testing at Trial {}".format(trial))
            msg = ""
            test()
            dqn_agent.save_model("trial_{}".format(trial))
        elif not verbose:
            sys.stdout.write('\b' * len(msg))
            msg = "T{:6d} - L = {:0.4f}".format(trial, loss if loss else 9999)
            sys.stdout.write(msg)
            sys.stdout.flush()

    train_end()


if __name__ == "__main__":
    main()
