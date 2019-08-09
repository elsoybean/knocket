import os  # NOQA: E402

import warnings  # NOQA: E402
warnings.filterwarnings('ignore')  # NOQA: E402

import tensorflow as tf  # NOQA: E402

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # NOQA: E402
tf.compat.v1.logging.set_verbosity(tf.compat.v1.logging.ERROR)  # NOQA: E402

import sys
import json
import numpy as np
from keras.models import load_model
from os import path
from .encoder import Encoder

default_model_filename = "../../models/dqn_models/new_model/trial_0.model"
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
    #action = e.actions[np.argmax(probs)]
    action = np.random.choice(e.actions, p=probs)
    print('Probs: ', probs, 'Action: ', action, file=sys.stderr)
    sys.stderr.flush()
    print(action)
    sys.stdout.flush()
