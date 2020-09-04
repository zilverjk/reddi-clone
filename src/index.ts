import { MikroORM } from '@mikro-orm/core'
import dotenv from 'dotenv'

dotenv.config()

const main = async () => {
  const orm = await MikroORM.init({
    dbName: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    debug: process.env.NODE_ENV !== 'production',
  })
}

main()
