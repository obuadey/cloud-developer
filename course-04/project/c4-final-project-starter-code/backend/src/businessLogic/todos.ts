import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TodoUpdate } from '../models/TodoUpdate';
import { TodosAccess } from '../dataLayer/todosAcess';

const logger = createLogger('todos')

const todosAccess = new TodosAccess()
const attachmentUtil = new AttachmentUtils()

export async function getTodosForUser (userId: string): Promise<TodoItem[]> {
  logger.info('Retrieving TODOs for user',userId)
  return await todosAccess.getAllTodos(userId)
}

export async function createTodo (createRequest: CreateTodoRequest, userId: string): Promise<TodoItem> {
  logger.info('Creating TODO for user',userId)
  const todoId = uuid.v4()
  
  return await todosAccess.createTodo({
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toISOString(),
    done: false,
    name: createRequest.name,
    attachmentUrl: null,
    dueDate: createRequest.dueDate
  })
}

export async function getTodo(todoId: string,userId: string): Promise<TodoItem> {
  logger.info('Getting TODO for user ',userId)
  return await todosAccess.getTodo(todoId,userId)
}

export async function updateTodo(updateRequest: UpdateTodoRequest, todoId: string,userId: string){
  logger.info('Updating TODO with id ',todoId)
  todosAccess.updateTodo(todoId,updateRequest as TodoUpdate,userId)
}

export async function createAttachmentPresignedUrl (todoId: string): Promise<string> {
  const url = await attachmentUtil.getUploadUrl(todoId)
  logger.info('creating presigned url for -> ' + todoId)
  return url
}

export async function updateAttachmentUrl(todoId: string,userId: string) {
  const todoItem = await todosAccess.getTodo(todoId,userId)
  const attachUrl = await attachmentUtil.getAttachmentUrl(todoId)

  await todosAccess.updateTodoWithURL(todoItem,attachUrl)

  return attachUrl
}

export async function deleteTodo(todoId: string, userId: string){
  logger.info('deleting TODO for user id -> ' + todoId)
  await todosAccess.deleteTodo(todoId,userId)
}