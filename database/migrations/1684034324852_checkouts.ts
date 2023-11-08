import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'checkouts'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('tool_id').unsigned().references('id').inTable('tools')
      table.integer('user_id').unsigned().references('id').inTable('users')
      table.integer('quantity').notNullable()
      table.string('status').notNullable()
      table.timestamp('start_date', { useTz: true })
      table.timestamp('end_date', { useTz: true }).defaultTo(this.now())
      table.string('purpose').notNullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
