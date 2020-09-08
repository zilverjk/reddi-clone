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
import redis from 'redis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import { MyContext } from './types'

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig)
  const app = express()
  const port = process.env.PORT || 4000

  await orm.getMigrator().up()

  dotenv.config()

  const RedisStore = connectRedis(session)
  const redisClient = redis.createClient()

  app.use(
    session({
      name: 'qid', // Nombre de la cookie donde se guarda el usuario
      store: new RedisStore({ client: redisClient, disableTouch: true, disableTTL: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 años
        httpOnly: true,
        sameSite: 'lax', // CSRF
        secure: process.env.NODE_ENV === 'production', // cookie only works in https
      },
      saveUninitialized: false,
      secret: `${process.env.REDIS_SECRET}`,
      resave: false,
    })
  )

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
  })

  server.applyMiddleware({ app })

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`)
  })
}

main().catch(err => console.error(err))
