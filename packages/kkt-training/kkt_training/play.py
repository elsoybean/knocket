import sys
import json
import os
import numpy as np
from keras.models import load_model
from os import path
from .encoder import Encoder

default_model_filename = "../../models/dqn_models/new_model/trial-0.model"
model_filename = sys.argv[1] if len(sys.argv) > 1 else default_model_filename
trained_model = load_model(model_filename)
e = Encoder()

done = False
while not done:
    try:
        line = sys.stdin.readline()
    except:
        done = True

    if not line:
        done = True

    data = json.loads(line)
    state = e.encode_state(data).reshape(1, -1)
    probs = trained_model.predict(state)[0]
    action = e.actions[np.argmax(probs)]
    print('Probs: ', probs, 'Action: ', action, file=sys.stderr)
    sys.stderr.flush()
    print(action)
    sys.stdout.flush()
