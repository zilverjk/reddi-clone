import { User } from '../entities/User'
import { MyContext } from '../types'
import argon from 'argon2'
import { Resolver, Mutation, Field, InputType, Ctx, Arg, ObjectType, Query } from 'type-graphql'

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string

  @Field()
  password: string
}

@ObjectType()
class FieldError {
  @Field()
  field: string

  @Field()
  message: string
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]

  @Field(() => User, { nullable: true })
  user?: User
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    // You are not logged in
    if (!req.session.userId) return null

    return await em.findOne(User, { id: req.session.userId })
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('inputs') inputs: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (inputs.username.length <= 2) {
      return {
        errors: [
          {
            field: 'username',
            message: 'length must be greater than 2 characters',
          },
        ],
      }
    }

    if (inputs.password.length <= 3) {
      return {
        errors: [
          {
            field: 'password',
            message: 'length must be greater than 3 characters',
          },
        ],
      }
    }

    const hashedPassword = await argon.hash(inputs.password)

    const user = em.create(User, { username: inputs.username, password: hashedPassword })

    try {
      await em.persistAndFlush(user)
    } catch (error) {
      console.log('message: ', error.message)
    }

    // Logeamos al usuario y guardamos la sesion en la cookie
    req.session.userId = user.id

    return { user }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('inputs') inputs: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: inputs.username })

    if (!user) {
      return {
        errors: [
          {
            field: 'username',
            message: `Username doesn't exists`,
          },
        ],
      }
    }

    const validPassword = await argon.verify(user.password, inputs.password)

    if (!validPassword) {
      return {
        errors: [
          {
            field: 'password',
            message: 'Password is not correct',
          },
        ],
      }
    }

    req.session.userId = user.id

    return { user }
  }
}
