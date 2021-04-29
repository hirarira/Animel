import { reducerWithInitialState } from 'typescript-fsa-reducers'
import { Actions } from './actionns';

export interface State {
  test: number
}

export const initialState: State = {
  test: 0
}

export const Reducer = reducerWithInitialState(initialState)
.case(Actions.updateTestValue, (state, value) => {
  return {
    ...state,
    test: value
  }
});
