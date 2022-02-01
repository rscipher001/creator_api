import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AddProjectInputColumnToProjects extends BaseSchema {
  protected tableName = 'projects'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.json('projectInput')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('projectInput')
    })
  }
}
