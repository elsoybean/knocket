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


class Explorer(Strategy):
    def act(self, state):
        facing = state["proximity"][0]
        if facing["type"] == "bot" and facing["damage"] != "total":
            return "attack"
        if facing["type"] == "wall" or facing["type"] == "bot":
            return choice(["rotatecw", "rotateccw"])
        return choice(["rotatecw", "rotateccw", "ahead", "ahead", "ahead", "reverse"])


class Erratic(Strategy):
    def __init__(self, length):
        self.length = length

    def act(self, state):
        last_moves = [Encoder.move_to_action(
            h) for h in state.get("moveHistory", [])[:self.length]]
        return choice(list(set(actions) - set(last_moves)))


class Hunter(Strategy):
    def act(self, state):
        facing = state["proximity"][0]
        if facing["type"] == "bot" and facing["damage"] != "total":
            return "attack"
        if facing.get("damage", "") == "total":
            return choice(["rotatecw", "rotateccw"])
        if state["compass"][0]:
            return "ahead"
        if state["compass"][1] or state["compass"][2]:
            return "rotatecw"
        if state["compass"][4] or state["compass"][5]:
            return "rotateccw"
        return choice(["rotatecw", "rotateccw"])
