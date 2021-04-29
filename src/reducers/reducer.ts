import { reducerWithInitialState } from 'typescript-fsa-reducers'
import { GoogleProfile } from '../type/GoogleOAuth';
import { Actions } from './actionns';

export interface State {
  test: number,
  loginInfo: GoogleProfile | null,
  isShowPrivate: boolean
}

export const initialState: State = {
  test: 0,
  loginInfo: null,
  isShowPrivate: false
}

export const Reducer = reducerWithInitialState(initialState)
.case(Actions.updateTestValue, (state, value) => {
  return {
    ...state,
    test: value
  }
})
.case(Actions.updateLoginInfo, (state, value) => {
  return {
    ...state,
    loginInfo: value
  }
})
.case(Actions.switchIsShowPrivate, (state, value) => {
  return {
    ...state,
    isShowPrivate: value
  }
})
