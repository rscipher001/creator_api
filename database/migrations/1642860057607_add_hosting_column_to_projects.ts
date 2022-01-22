import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddHostingColumnToProjects extends BaseSchema {
  protected tableName = 'projects'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('url')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('url')
    })
  }
}
