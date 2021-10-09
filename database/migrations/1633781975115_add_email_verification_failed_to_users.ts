import User from 'App/Models/User'
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddEmailVerificationFailedToUsers extends BaseSchema {
  protected tableName = User.table

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.timestamp('emailVerifiedAt').nullable()
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
