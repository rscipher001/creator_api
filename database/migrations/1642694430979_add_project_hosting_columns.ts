import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddProjectHostingColumns extends BaseSchema {
  protected tableName = 'projects'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('isHosted')
      table.boolean('isDeleted')
      table.boolean('isCleaned')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('isHosted')
      table.dropColumn('isDeleted')
      table.dropColumn('isCleaned')
    })
  }
}
