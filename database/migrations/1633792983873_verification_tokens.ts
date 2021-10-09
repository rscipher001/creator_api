import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class VerificationTokens extends BaseSchema {
  protected tableName = 'verificationTokens'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('email', 128).unique().notNullable()
      table.string('token', 128).index().notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('createdAt', { useTz: true })
      table.timestamp('updatedAt', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
