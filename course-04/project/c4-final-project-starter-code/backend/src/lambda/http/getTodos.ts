import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'

const logger = createLogger('getTodos')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Getting TODOs',event)   
    const userId = getUserId(event)
    
    if(!userId){
      return {
        statusCode: 404,
        body: "Unable to find the provided user id"
      }
    }

    const items = await getTodosForUser(userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: items
      })
    }
})

handler.use(
  cors({
    credentials: true
  })
)