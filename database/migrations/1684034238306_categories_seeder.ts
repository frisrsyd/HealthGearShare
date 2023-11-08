import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import Database from '@ioc:Adonis/Lucid/Database'

export default class extends BaseSchema {
  protected tableName = 'categories'

  public async up () {
  
    await Database.table(this.tableName).insert([
      {name: 'Tongkat Jalan', slug: 'tongkat-jalan'},
      {name: 'Kursi Roda', slug: 'kursi-roda'},
    ])
  }

  public async down () {
    await Database.from(this.tableName).delete()
  }
}

