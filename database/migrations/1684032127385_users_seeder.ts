import Hash from '@ioc:Adonis/Core/Hash';
import Database from '@ioc:Adonis/Lucid/Database'
import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    const password_faris = await Hash.make('faris')
    const password_agil = await Hash.make('agil')
    const password_devi = await Hash.make('devi')

    await Database.table(this.tableName).insert([
      {name: 'Faris', email:'mahasiswa@gmail.com', nik: '1106070502030001', password: password_faris},
      {name: 'Agil', email:'agil@gmail.com', nik: '1106070502030002', password: password_agil},
      {name: 'Devi', email:'devi@gmail.com', nik: '1106070502030003', password: password_devi},
    ])
  }

  public async down () {
    await Database.from(this.tableName).delete()
  }
}
