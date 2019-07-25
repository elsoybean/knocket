//@flow

export type AheadOptions = void;

export type RotateOptions = { clockwise?: boolean };

export type AttackOptions = void;

export type Move =
    | { type: 'ahead', options?: AheadOptions }
    | { type: 'rotate', options?: RotateOptions }
    | { type: 'attack', options?: AttackOptions };
