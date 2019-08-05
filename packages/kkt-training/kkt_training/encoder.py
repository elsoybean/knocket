import numpy as np


class Encoder:
    actions = ["attack", "rotatecw", "rotateccw",
               "ahead", "reverse", "wait", "defend"]
    damage_estimates = ['none', 'minor', 'major', 'total']
    proximity_types = ['none', 'wall', 'bot']
    proximity_sensors = 4
    previous_readings = 3
    max_time = 2000

    @staticmethod
    def decode_action(action):
        return Encoder.actions[action.index(1)]

    @staticmethod
    def encode_damage(dmg):  # 4
        output = []
        for lbl in Encoder.damage_estimates:
            output.append(1 if lbl == dmg else 0)
        return output

    @staticmethod
    def encode_heading(h):  # 6
        output = []
        for lbl in range(6):
            output.append(1 if lbl == h else 0)
        return output

    @staticmethod
    def move_to_action(move):
        move_type = move.get('type', 'n/a')
        if move_type == 'rotate':
            move_type += 'cw' if move.get("clockwise") else 'ccw'
        return move_type

    @staticmethod
    def encode_move(move):  # 7
        output = []
        action = Encoder.move_to_action(move)
        for lbl in Encoder.actions:
            output.append(1 if lbl == action else 0)
        return output

    @staticmethod
    def encode_proximity(prox_data):  # 3 + 6 + 4 + 7 = 20
        output = []
        for lbl in Encoder.proximity_types:
            output.append(1 if lbl == prox_data.get("type", "n/a") else 0)
        output += Encoder.encode_heading(prox_data.get('heading', -1))
        output += Encoder.encode_damage(prox_data.get('damage', 'n/a'))
        output += Encoder.encode_move(prox_data.get('lastMove', {}))
        return output

    @staticmethod
    def encode_range_finder(data):  # 6
        return [1 if data[i] else 0 for i in range(6)]

    @staticmethod
    def encode_reading(data):  # 1 + 20 + 20 + 20 + 20 + 4 + 6 + 6 = 97
        output = []
        output.append(data.get("elapsed", 0) / Encoder.max_time)
        for i in range(Encoder.proximity_sensors):
            output += Encoder.encode_proximity(data.get("proximity",
                                                        [{}] * Encoder.proximity_sensors)[i])
        output += Encoder.encode_damage(data.get("damage"))
        output += Encoder.encode_heading(data.get("heading"))
        output += Encoder.encode_range_finder(
            data.get("compass", [False]*6))
        return output

    @staticmethod
    def encode_move_history(data):
        output = []
        for i in range(len(data)):
            output += [data[i].get("elapsed", 0) / 10] + \
                Encoder.encode_move(data[i])
        for i in range(len(data), 5):
            output += [0] + Encoder.encode_move({})
        return output

    @staticmethod
    def encode_state(raw_state):  # 97 + 97 + 97 + 97 + 1 + 1
        output = []
        encoded_reading = Encoder.encode_reading(raw_state)
        output += encoded_reading
        previous = raw_state.get("previousReadings", [])
        for i in range(len(previous)):
            output += Encoder.encode_reading(previous[i])
        for i in range(len(previous), Encoder.previous_readings):
            output += [0] * len(encoded_reading)

        damages = raw_state.get("damages", [])
        output.append(1 if any(dmg["dealt"] for dmg in damages) else 0)
        output.append(1 if any(not dmg["dealt"] for dmg in damages) else 0)

        output += Encoder.encode_move_history(raw_state.get('moveHistory', []))

        return np.array(output)

    @staticmethod
    def encode_action(action):  # 7
        return np.eye(len(Encoder.actions), dtype=int)[Encoder.actions.index(action)]


Encoder.encoded_state_length = len(Encoder.encode_state({}))
