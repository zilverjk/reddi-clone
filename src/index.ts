import 'reflect-metadata'
import { MikroORM } from '@mikro-orm/core'
import dotenv from 'dotenv'
import mikroOrmConfig from './mikro-orm.config'
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'

dotenv.config()

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig)
  const app = express()
  const port = process.env.PORT || 4000

  await orm.getMigrator().up()

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  })

  server.applyMiddleware({ app })

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })
}

main().catch(err => console.error(err))
