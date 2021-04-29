import { actionCreatorFactory } from 'typescript-fsa';
import { GoogleProfile } from '../type/GoogleOAuth';

const actionCreator = actionCreatorFactory()

export const Actions = {
    updateTestValue: actionCreator<number>('UPDATE_TEST_VALUE'),
    updateLoginInfo: actionCreator<GoogleProfile>('UPDATE_LOGIN_INFO')
}
