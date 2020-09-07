import dotenv from 'dotenv'
import { Post } from './entities/Post'
import { MikroORM } from '@mikro-orm/core'
import path from 'path'
import { User } from './entities/User'

dotenv.config()

export default {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, User],
  type: process.env.DB_ENGINE,
  dbName: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  debug: process.env.NODE_ENV !== 'production',
} as Parameters<typeof MikroORM.init>[0]
