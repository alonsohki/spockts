import { State } from './state';

export const validate = (state: State): void => {
  if (state.where.length && !state.expect.length) throw new Error('Cannot have a where block without an expect block');
};
