import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')

export class TodosAccess{

  constructor (
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly userIndex = process.env.USER_ID_INDEX){}

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all TODOs')

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.userIndex,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    const items = result.Items
    logger.info('All TODOs', items)

    return items as TodoItem[]
  }

  async getTodo(todoId: string,userId: string): Promise<TodoItem> {
    logger.info('Getting TODO with id', todoId)

    const result = await this.docClient.get({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    }).promise()

    return result.Item as TodoItem
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    logger.info('creating TODO', todoItem)

    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()

    return todoItem
  }

  async updateTodo(todoId: string, todoUpdate: TodoUpdate,userId: string){
    logger.info('Updating TODO', todoUpdate)

    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      ExpressionAttributeNames: {"#N": "name"},
      UpdateExpression:'set #N = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeValues:{
        ":name": todoUpdate.name,
        ":dueDate": todoUpdate.dueDate,
        ":done": todoUpdate.done
      }
    }).promise()
  }
  

  async updateTodoWithURL(todoItem: TodoItem, attachmentUrl: string){

    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId: todoItem.userId,
        todoId: todoItem.todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    }).promise()
  }

  async deleteTodo(todoId: string,userId: string){
    logger.info('Deleting TODO item for TODO Id -> ' + userId)
    await this.docClient.delete({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    }).promise()
  }
}