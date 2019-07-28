import json
import gym
from gym import error, spaces, utils
from gym.utils import seeding
from subprocess import Popen, PIPE


def calculate_reward(data):
    reward = 0
    for dmg in data["damages"]:
        if dmg["dealt"]:
            reward += 2
        else:
            reward -= 1.5

    return reward


class KnocketEnv(gym.Env):
    metadata = {'render.modes': ['human']}
    action_space = ["ahead", "wait", "attack", "rotatecw", "rotateccw"]

    def __init__(self):
        self.kkt = False
        self.state = {}
        self.done = False

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
            if "outcome" in self.state:
                self.done = True
            reward = calculate_reward(self.state)
        else:
            self.state = {}
            reward = 0

        return [self.state, reward, self.done, {}]

    def reset(self):
        if self.kkt:
            self.kkt.kill()

        self.kkt = Popen(['node', './packages/kkt-runner/lib/train.js'],
                         universal_newlines=True, stdout=PIPE, stdin=PIPE)
        line = self.kkt.stdout.readline()
        self.state = json.loads(line)
        return self.state

    def render(self, mode='human', close=False):
        pass
