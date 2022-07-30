import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Creating a TODO for user', event)
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    const item = await createTodo(newTodo,userId)

    if(!userId || !item){
      return {
        statusCode: 404,
        body: "Unable to create the TODO"
      }
    }

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: item
      })
    }
  })

handler.use(
  cors({
    credentials: true
  })
)