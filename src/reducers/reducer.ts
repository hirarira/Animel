import { reducerWithInitialState } from 'typescript-fsa-reducers'

export interface State {
  test: number
}

export const initialState: State = {
  test: 0
}

export const Reducer = reducerWithInitialState(initialState)
