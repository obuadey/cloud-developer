import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { updateTodo, getTodo} from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import {createLogger} from '../../utils/logger'

const logger = createLogger('updateTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Attempting to update TODO', event)
    const todoId = event.pathParameters.todoId
    const userId = getUserId(event)
    const todo = await getTodo(todoId,userId)

    if(!todo){
      logger.warn('TODO was not found for ' + userId)
      return {
        statusCode: 404,
        body: 'TODO was not found'
      }
    }
    
    if(todo.userId !== userId){
      logger.warn(`${userId} not authorized to update TODO`)
      return {
        statusCode:403,
        body: 'User is not authorized to update item'
      }
    }

    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    await updateTodo(updatedTodo,todoId,userId)

    return {
      statusCode: 200,
      body: ''
    }
  })

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )