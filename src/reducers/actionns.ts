import { actionCreatorFactory } from 'typescript-fsa';

const actionCreator = actionCreatorFactory()

export const Actions = {
    updateTestValue: actionCreator<number>('UPDATE_TEST_VALUE')
}
