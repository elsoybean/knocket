from gym.envs.registration import register

register(
    id='kkt-v1',
    entry_point='gym_knocket.envs:KnocketEnv',
)
