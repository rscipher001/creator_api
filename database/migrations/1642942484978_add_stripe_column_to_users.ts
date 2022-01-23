import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddStripeColumnToUsers extends BaseSchema {
  protected tableName = 'users'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.json('stripe')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('stripe')
    })
  }
}
