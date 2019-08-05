import unittest
import numpy as np
from .strategy import Attack
from .strategy import Random
from .strategy import Weighted
from .strategy import Erratic
from .encoder import Encoder


class TestAttackStrategy(unittest.TestCase):

    def test_act(self):
        s = Attack()
        state = "literally anything"
        self.assertEqual(s.act(state), 'attack')


class TestRandomStrategy(unittest.TestCase):

    def test_act(self):
        s = Random()
        state = "literally anything"
        self.assertTrue(s.act(state) in Encoder.actions)


class TestWeightedStrategy(unittest.TestCase):

    def test_init(self):
        s = Weighted({"attack": 3, "rotatecw": 1/2,
                      "rotateccw": 1 / 2, "defend": 0, "wait": 0})
        self.assertTrue(np.array_equal(s.probabilities, [
                        1 / 2, 1 / 12, 1 / 12, 1 / 6, 1 / 6, 0, 0]))
        self.assertEqual(1, sum(s.probabilities))

    def test_act(self):
        s = Weighted({"attack": 3, "rotatecw": 1/2,
                      "rotateccw": 1 / 2, "defend": 0, "wait": 0})
        state = "literally anything"
        self.assertTrue(s.act(state) in Encoder.actions)


class TestErraticStrategy(unittest.TestCase):
    def test_act(self):
        s = Erratic(6)
        state = {"moveHistory": [
            {"type": "attack"},
            {"type": "ahead"},
            {"type": "defend"},
            {"type": "reverse"},
            {"type": "rotate", "clockwise": True},
            {"type": "rotate", "clockwise": False},
        ]}
        self.assertEqual(s.act(state), "wait")
