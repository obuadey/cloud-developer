import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { deleteTodo, getTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('deleteTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Attempting to delete TODO', event)
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
      logger.warn(`${userId} not authorized to delete TODO`)
      return {
        statusCode: 403,
        body: 'User is not authorized to delete item'
      }
    }

    await deleteTodo(todoId,userId)
    
    return {
      statusCode: 204,
      body: ''
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )