import { DateTime } from 'luxon'
import { BaseModel, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Tool from './Tool'

export default class Category extends BaseModel {
    @column({ isPrimary: true })
    public id : number
    
    @column()
    public name : string
    
    @column()
    public slug : string
    
    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime
  
    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt?: DateTime

    @hasMany(() => Tool)
    public tools: HasMany<typeof Tool>
}

