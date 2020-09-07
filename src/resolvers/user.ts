import { User } from '../entities/User'
import { MyContext } from '../types'
import argon from 'argon2'
import { Resolver, Mutation, Field, InputType, Ctx, Arg, ObjectType } from 'type-graphql'

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
  @Mutation(() => User)
  async register(@Arg('inputs') inputs: UsernamePasswordInput, @Ctx() { em }: MyContext) {
    const hashedPassword = await argon.hash(inputs.password)
    const user = em.create(User, { username: inputs.username, password: hashedPassword })
    await em.persistAndFlush(user)
    return user
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('inputs') inputs: UsernamePasswordInput,
    @Ctx() { em }: MyContext
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

    return { user }
  }
}
