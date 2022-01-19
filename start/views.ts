import View from '@ioc:Adonis/Core/View'
import ProjectInput, { Relation } from 'App/Interfaces/ProjectInput'

View.global('findRelationModel', function (input: ProjectInput, relation: Relation) {
  if (['$auth', '$nonAuth'].includes(relation.withModel)) {
    return input.auth.table
  }
  // TODO: Write logic to find tenant table when required
  return input.tables.find((table) => table.names.camelCase === relation.modelNames.camelCase)
})
