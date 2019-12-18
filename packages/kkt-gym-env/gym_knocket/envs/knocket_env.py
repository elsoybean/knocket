import json
import gym
import numpy as np
from numpy.random import choice
from math import trunc
from gym import error, spaces, utils
from gym.utils import seeding
from subprocess import Popen, PIPE


class KnocketEnv(gym.Env):
    metadata = {'render.modes': ['human']}

    def __init__(self, **kwargs):
        self.versus = kwargs.get('versus', ['lump',
                                            'erratic',
                                            'explorer',
                                            'facer',
                                            'sentinel',
                                            # 'hunter',
                                            'random',
                                            ])
        self.proficiency = kwargs.get('proficiency', [1.0, 0.9, 0.8, 0.7])
        self.runner = kwargs.get(
            'runner', './packages/kkt-runner/lib/train.js')
        self.kkt = False
        self.action_space = spaces.Discrete(7)

    def calculate_reward(self):
        reward = 0
        for dmg in self.state["damages"]:
            if dmg["dealt"]:
                reward += trunc(dmg['amount'] / 200) * 0.5
            else:
                reward -= trunc(dmg['amount'] / 100) * 0.25

        return reward

    def step(self, action):
        print(action, file=self.kkt.stdin)
        self.kkt.stdin.flush()

        line = None
        try:
            line = self.kkt.stdout.readline()
        except:
            self.done = True

        if not line:
            self.done = True

        if not self.done:
            self.state = json.loads(line)
            reward = self.calculate_reward()
            reward += 1 if self.state.get("outcome", "n/a") == "winner" else 0
            if "outcome" in self.state:
                self.done = True
                # reward += 1 if self.state["outcome"] == "winner" else -1
        else:
            self.state = {}
            reward = 0

        return [self.state, reward, self.done, {}]

    def reset(self):
        if self.kkt:
            self.kkt.kill()

        botA = choice(self.versus)
        botA_p = choice(self.proficiency)
        botB = choice(self.versus)
        botB_p = choice(self.proficiency)

        self.kkt = Popen(['node', self.runner, botA, "{:0.2f}".format(botA_p), botB, "{:0.2f}".format(botB_p)],
                         universal_newlines=True, stdout=PIPE, stdin=PIPE)
        self.done = False
        line = self.kkt.stdout.readline()
        self.state = json.loads(line)
        return self.state

    def render(self, mode='human', close=False):
        pass
