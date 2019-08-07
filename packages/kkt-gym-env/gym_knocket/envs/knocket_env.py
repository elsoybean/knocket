import json
import gym
import numpy as np
from math import trunc
from gym import error, spaces, utils
from gym.utils import seeding
from subprocess import Popen, PIPE


class KnocketEnv(gym.Env):
    metadata = {'render.modes': ['human']}

    def __init__(self, **kwargs):
        self.versus = kwargs.get('versus', 'basic')
        self.runner = kwargs.get(
            'runner', './packages/kkt-runner/lib/train.js')
        self.kkt = False
        self.action_space = spaces.Discrete(7)

    def calculate_reward(self):
        reward = 0
        for dmg in self.state["damages"]:
            if dmg["dealt"]:
                reward += trunc(dmg['amount'] / 20)
            else:
                reward -= trunc(dmg['amount'] / 20)

        return reward

    def step(self, action):
        print(action, file=self.kkt.stdin)
        self.kkt.stdin.flush()

        try:
            line = self.kkt.stdout.readline()
        except:
            self.done = True

        if not line:
            self.done = True

        if not self.done:
            self.state = json.loads(line)
            reward = self.calculate_reward()
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

        self.kkt = Popen(['node', self.runner, self.versus],
                         universal_newlines=True, stdout=PIPE, stdin=PIPE)
        self.done = False
        line = self.kkt.stdout.readline()
        self.state = json.loads(line)
        return self.state

    def render(self, mode='human', close=False):
        pass
