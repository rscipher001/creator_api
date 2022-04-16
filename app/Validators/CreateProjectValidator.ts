import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import {
  Backend,
  Database,
  Frontend,
  Mailer,
  ProjectType,
  RequestMethod,
  Storage,
} from 'App/Interfaces/Enums'

export default class CreateProjectValidator {
  constructor(protected ctx: HttpContextContract) {}

  protected appSchema = schema.object
    .optional([rules.requiredWhen('generate.app.generate', '=', true)])
    .members({
      appName: schema.string({ trim: true }),
      packageName: schema.string({ trim: true }, [rules.url()]),
    })

  protected relationSchema = schema.object().members({
    type: schema.string({ trim: true }),
    withModel: schema.string({ trim: true }),
    name: schema.string.optional({ trim: true }),
    required: schema.boolean(),
    showInputOnCreatePage: schema.boolean.optional(),
  })

  protected columnSchema = schema.object().members({
    name: schema.string({ trim: true }),
    type: schema.string({ trim: true }),
    meta: schema.object().members({
      displayName: schema.string.optional({ trim: true }),
      required: schema.boolean.optional(),
      multiline: schema.boolean.optional(),
      minLength: schema.number.optional(),
      maxLength: schema.number.optional(),
      min: schema.number.optional(),
      max: schema.number.optional(),
      maxSize: schema.string.optional({ trim: true }),
      extensions: schema.array.optional().members(schema.string({ trim: true })),
      dbLength: schema.number.optional(),
      email: schema.boolean.optional(),
      expose: schema.boolean.optional(),
      filterable: schema.boolean.optional(),
      sortable: schema.boolean.optional(),
      unique: schema.boolean.optional(),
      trim: schema.boolean.optional(),
    }),
    input: schema.object.optional().members({
      type: schema.string({ trim: true }),
      decimal: schema.object.optional().anyMembers(),
      select: schema.object.optional().anyMembers(),
    }),
  })

  protected tableSchema = schema.object().members({
    name: schema.string({ trim: true }, rules.maxLength['127']),
    generateUI: schema.boolean.optional(),
    generateController: schema.boolean(),
    generateModel: schema.boolean(),
    generateMigration: schema.boolean(),
    defaultColumn: schema.string({ trim: true }),
    timestamps: schema.boolean.optional(),
    generateRoute: schema.boolean.optional(),
    singleton: schema.boolean.optional(),
    parent: schema.string.optional({ trim: true }),
    routeParents: schema.array.optional().members(schema.string({ trim: true })),
    indexColumns: schema.array.optional().members(schema.string({ trim: true })),
    operations: schema.object().members({
      index: schema.boolean.optional(),
      create: schema.boolean.optional(),
      store: schema.boolean.optional(),
      edit: schema.boolean.optional(),
      show: schema.boolean.optional(),
      update: schema.boolean.optional(),
      destroy: schema.boolean.optional(),
      storeMany: schema.boolean.optional(),
      destroyMany: schema.boolean.optional(),
    }),
    customOperations: schema.array().members(
      schema.object().members({
        name: schema.string({ trim: true }),
        method: schema.enum([
          RequestMethod.GET,
          RequestMethod.POST,
          RequestMethod.PATCH,
          RequestMethod.PUT,
          RequestMethod.DELETE,
        ] as const),
        singular: schema.boolean(),
      })
    ),
    relations: schema.array().members(this.relationSchema),
    columns: schema.array().members(this.columnSchema),
  })

  public schema = schema.create({
    name: schema.string({ trim: true }, [rules.minLength(2), rules.maxLength(256)]),
    database: schema.enum([
      Database.MSSQL,
      Database.MySQL,
      Database.OracleDB,
      Database.PostgreSQL,
      Database.SQLite,
    ] as const),
    types: schema.array().members(schema.enum([ProjectType.API, ProjectType.SSR] as const)),
    camelCaseStrategy: schema.boolean(),
    app: this.appSchema,
    mailEnabled: schema.boolean(),
    mailers: schema.array
      .optional([rules.requiredWhen('mailEnabled', '=', true)])
      .members(
        schema.enum.optional([Mailer.SMTP, Mailer.SES, Mailer.Mailgun, Mailer.SparkPost] as const)
      ),
    defaultMailer: schema.string.optional({ trim: true }, [
      rules.requiredWhen('mailEnabled', '=', true),
    ]),
    storageEnabled: schema.boolean(),
    storageDrivers: schema.array
      .optional([rules.requiredWhen('storageEnabled', '=', true)])
      .members(schema.enum.optional([Storage.GCS, Storage.Local, Storage.S3] as const)),
    defaultStorageDriver: schema.string.optional({ trim: true }, [
      rules.requiredWhen('storageEnabled', '=', true),
    ]),
    tech: schema.object().members({
      backend: schema.enum([Backend.Adonis] as const),
      frontend: schema.enum([Frontend.Buefy] as const),
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
      website: schema.object.optional().members({
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
    rbac: schema.object().members({
      enabled: schema.boolean(),
      multipleRoles: schema.boolean.optional([rules.requiredWhen('rbac.enabled', '=', true)]),
      roles: schema.array.optional([rules.requiredWhen('rbac.enabled', '=', true)]).members(
        schema.object().members({
          name: schema.string({ trim: true }),
          description: schema.string.optional({ trim: true }),
          default: schema.boolean.optional(),
        })
      ),
      permissions: schema.array.optional([rules.requiredWhen('rbac.enabled', '=', true)]).members(
        schema.object().members({
          name: schema.string({ trim: true }),
          description: schema.string.optional({ trim: true }),
        })
      ),
      matrix: schema.array.optional([rules.requiredWhen('rbac.enabled', '=', true)]).members(
        schema.object().members({
          role: schema.string({ trim: true }),
          permissions: schema.array().members(schema.string({ trim: true })),
        })
      ),
    }),
    tables: schema.array().members(this.tableSchema),
  })

  public messages = {}
}
