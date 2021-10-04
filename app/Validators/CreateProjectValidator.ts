import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class CreateProjectValidator {
  constructor(protected ctx: HttpContextContract) {}

  protected relationSchema = schema.object().members({
    type: schema.string({ trim: true }),
    withModel: schema.string({ trim: true }),
    name: schema.string.optional({ trim: true }),
    required: schema.boolean(),
  })

  protected columnSchema = schema.object().members({
    name: schema.string({ trim: true }),
    type: schema.string({ trim: true }),
    meta: schema.object().members({
      displayName: schema.string.optional({ trim: true }),
      required: schema.boolean.optional(),
      minLength: schema.number.optional(),
      maxLength: schema.number.optional(),
      dbLength: schema.number.optional(),
      email: schema.boolean.optional(),
      unique: schema.boolean.optional(),
      trim: schema.boolean.optional(),
    }),
    input: schema.object.optional().members({
      type: schema.string({ trim: true }),
    }),
  })

  protected tableSchema = schema.object().members({
    name: schema.string({ trim: true }, rules.maxLength['127']),
    skipController: schema.boolean.optional(),
    skipModel: schema.boolean.optional(),
    skipMigration: schema.boolean.optional(),
    skipUI: schema.boolean.optional(),
    timestamp: schema.boolean.optional(),
    generateRoute: schema.boolean.optional(),
    singleton: schema.boolean.optional(),
    parent: schema.string.optional({ trim: true }),
    routeParents: schema.array.optional().members(schema.string({ trim: true })),
    operations: schema
      .array()
      .members(
        schema.enum([
          'index',
          'create',
          'store',
          'show',
          'edit',
          'update',
          'destroy',
          'storeMany',
          'destroyMany',
        ] as const)
      ),
    relations: schema.array().members(this.relationSchema),
    columns: schema.array().members(this.columnSchema),
  })

  public schema = schema.create({
    name: schema.string({ trim: true }, [rules.minLength(2), rules.maxLength(256)]),
    database: schema.enum(['mysql'] as const),
    types: schema.array().members(schema.enum(['api'] as const)),
    camelCaseStrategy: schema.boolean(),
    mailers: schema
      .array()
      .members(schema.enum.optional(['mailgun', 'smtp', 'ses', 'sparkpost'] as const)),
    defaultMailer: schema.string.optional(),
    tech: schema.object().members({
      backend: schema.enum(['adonis'] as const),
      frontend: schema.enum(['buefy'] as const),
    }),
    generate: schema.object().members({
      api: schema.object().members({
        generate: schema.boolean(),
        crud: schema.boolean(),
        test: schema.boolean(),
      }),
      spa: schema.object().members({
        generate: schema.boolean(),
        crud: schema.boolean(),
      }),
      app: schema.object.optional().members({
        generate: schema.boolean(),
      }),
      web: schema.object.optional().members({
        generate: schema.boolean(),
      }),
    }),
    auth: schema.object().members({
      register: schema.boolean(),
      passwordReset: schema.boolean(),
      passwordChange: schema.boolean(),
      table: this.tableSchema,
    }),
    tenantSettings: schema.object().members({
      user: schema.enum([1, 0, 'n'] as const),
      tenant: schema.enum([1, 0, 'n'] as const),
      table: schema.string.optional({ trim: true }),
    }),
    tables: schema.array().members(this.tableSchema),
  })

  public messages = {}
}
