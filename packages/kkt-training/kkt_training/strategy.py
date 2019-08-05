import numpy as np
from numpy.random import choice
from .encoder import Encoder

actions = Encoder.actions


class Strategy:
    def act(self, state):
        raise NotImplementedError

    def name(self):
        return type(self).__name__


class Attack(Strategy):
    def act(self, state):
        return "attack"


class Wait(Strategy):
    def act(self, state):
        return "wait"


class Random(Strategy):
    def act(self, state):
        return choice(actions)


class Weighted(Strategy):
    def __init__(self, weights):
        w = [weights.get(a, 1) for a in actions]
        self.probabilities = np.array(w) / sum(w)

    def act(self, state):
        return choice(actions, p=self.probabilities)


class Basic(Strategy):
    def act(self, state):
        if state["proximity"][0]["type"] == "bot":
            return "attack"
        if state["proximity"][0]["type"] == "wall":
            return choice(["rotatecw", "rotateccw"])
        return choice(["rotatecw", "rotateccw", "ahead", "ahead", "ahead", "reverse"])
