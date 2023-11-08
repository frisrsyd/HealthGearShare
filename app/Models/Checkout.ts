import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Tool from './Tool'
import User from './User'

export default class Checkout extends BaseModel {
    @column()
    public id : number
    
    @column()
    public toolId : number
    
    @column()
    public userId : number
    
    @column()
    public quantity : number
    
    @column()
    public status : string
    
    @column.dateTime()
    public startDate : DateTime
    
    @column.dateTime()
    public endDate : DateTime

    @column()
    public purpose : string
    
    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime
  
    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt?: DateTime

    @belongsTo(() => Tool)
    public tool: BelongsTo<typeof Tool>

    @belongsTo(() => User)
    public user: BelongsTo<typeof User>
}

