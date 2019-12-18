import unittest
from .encoder import Encoder
import numpy as np


class TestEncoderMethods(unittest.TestCase):

    def test_decode_action(self):
        e = Encoder()
        self.assertEqual(e.decode_action([1, 0, 0, 0, 0, 0, 0]), 'attack')
        self.assertEqual(e.decode_action([0, 1, 0, 0, 0, 0, 0]), 'rotatecw')
        self.assertEqual(e.decode_action([0, 0, 1, 0, 0, 0, 0]), 'rotateccw')
        self.assertEqual(e.decode_action([0, 0, 0, 1, 0, 0, 0]), 'ahead')
        self.assertEqual(e.decode_action([0, 0, 0, 0, 1, 0, 0]), 'reverse')
        self.assertEqual(e.decode_action([0, 0, 0, 0, 0, 1, 0]), 'wait')
        self.assertEqual(e.decode_action([0, 0, 0, 0, 0, 0, 1]), 'defend')

    def test_encode_damage(self):
        e = Encoder()
        self.assertEqual(e.encode_damage('none'), [1, 0, 0, 0])
        self.assertEqual(e.encode_damage('minor'), [0, 1, 0, 0])
        self.assertEqual(e.encode_damage('major'), [0, 0, 1, 0])
        self.assertEqual(e.encode_damage('total'), [0, 0, 0, 1])

    def test_encode_heading(self):
        e = Encoder()
        self.assertEqual(e.encode_heading(0), [1, 0, 0, 0, 0, 0])
        self.assertEqual(e.encode_heading(1), [0, 1, 0, 0, 0, 0])
        self.assertEqual(e.encode_heading(2), [0, 0, 1, 0, 0, 0])
        self.assertEqual(e.encode_heading(3), [0, 0, 0, 1, 0, 0])
        self.assertEqual(e.encode_heading(4), [0, 0, 0, 0, 1, 0])
        self.assertEqual(e.encode_heading(5), [0, 0, 0, 0, 0, 1])

    def test_encode_move(self):
        e = Encoder()
        self.assertEqual(e.encode_move({"type": "attack"}), [
                         1, 0, 0, 0, 0, 0, 0])
        self.assertEqual(e.encode_move({"type": "rotate", "clockwise": True}), [
                         0, 1, 0, 0, 0, 0, 0])
        self.assertEqual(e.encode_move({"type": "rotate", "clockwise": False}), [
                         0, 0, 1, 0, 0, 0, 0])
        self.assertEqual(e.encode_move({"type": "ahead"}), [
                         0, 0, 0, 1, 0, 0, 0])
        self.assertEqual(e.encode_move({"type": "reverse"}), [
                         0, 0, 0, 0, 1, 0, 0])
        self.assertEqual(e.encode_move({"type": "wait"}), [
                         0, 0, 0, 0, 0, 1, 0])
        self.assertEqual(e.encode_move({"type": "defend"}), [
                         0, 0, 0, 0, 0, 0, 1])

    def test_encode_proximity(self):
        e = Encoder()

        p = {"type": "none"}
        expected = [1, 0, 0] + [0]*(6 + 4 + 7)
        self.assertEqual(e.encode_proximity(p), expected)

        p = {"type": "wall"}
        expected = [0, 1, 0] + [0]*(6 + 4 + 7)
        self.assertEqual(e.encode_proximity(p), expected)

        p = {"type": "bot", "heading": 2, "damage": "minor",
             "lastMove": {"type": "ahead"}}
        expected = [0, 0, 1] + e.encode_heading(2) + e.encode_damage(
            "minor") + e.encode_move({"type": "ahead"})
        self.assertEqual(e.encode_proximity(p), expected)

    def test_encode_heat_sensor(self):
        e = Encoder()

        d = [True, True, False, False, False, False]
        expected = [1, 1, 0, 0, 0, 0]
        self.assertEqual(e.encode_heat_sensor(d), expected)

        d = [False, False, False, True, False, False]
        expected = [0, 0, 0, 1, 0, 0]
        self.assertEqual(e.encode_heat_sensor(d), expected)

        d = [False, True, False, False, False, False]
        expected = [0, 1, 0, 0, 0, 0]
        self.assertEqual(e.encode_heat_sensor(d), expected)

    def test_encode_reading(self):
        e = Encoder()

        bot_proximity = {"type": "bot", "heading": 3, "damage": "major",
                         "lastMove": {"type": "rotate", "clockwise": True}}
        d = {"elapsed": 237, "proximity": [
            {"type": "none"},
            {"type": "wall"},
            {"type": "none"},
            bot_proximity,
        ], "damage": "minor", "heading": 6, "compass": [False, False, False, False, False, True]}
        expected = e.encode_proximity({"type": "none"}) + e.encode_proximity({"type": "wall"}) + e.encode_proximity({"type": "none"}) + e.encode_proximity(
            bot_proximity) + e.encode_damage("minor") + e.encode_heading(6) + e.encode_heat_sensor([False, False, False, False, False, True])
        self.assertEqual(e.encode_reading(d), expected)

    def test_encode_action(self):
        e = Encoder()
        self.assertTrue(np.array_equal(
            e.encode_action("attack"), [1, 0, 0, 0, 0, 0, 0]))
        self.assertTrue(np.array_equal(
            e.encode_action("rotatecw"), [0, 1, 0, 0, 0, 0, 0]))
        self.assertTrue(np.array_equal(
            e.encode_action("rotateccw"), [0, 0, 1, 0, 0, 0, 0]))
        self.assertTrue(np.array_equal(
            e.encode_action("ahead"), [0, 0, 0, 1, 0, 0, 0]))
        self.assertTrue(np.array_equal(
            e.encode_action("reverse"), [0, 0, 0, 0, 1, 0, 0]))
        self.assertTrue(np.array_equal(
            e.encode_action("wait"), [0, 0, 0, 0, 0, 1, 0]))
        self.assertTrue(np.array_equal(
            e.encode_action("defend"), [0, 0, 0, 0, 0, 0, 1]))

    def test_encode_empty(self):
        e = Encoder()
        x = e.encode_state({})
        self.assertTrue(np.array_equal(x, [0] * len(x)))

    def test_encoded_state_length(self):
        e = Encoder()
        self.assertEqual(421, e.encoded_state_length)


if __name__ == '__main__':
    unittest.main()
