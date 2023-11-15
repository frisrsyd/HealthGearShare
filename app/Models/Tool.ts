import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, hasMany, HasMany } from '@ioc:Adonis/Lucid/Orm'
import User from './User'
import Category from './Category'
import Checkout from './Checkout'
import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'

export default class Tool extends BaseModel {
    @column()
    public id: number
    
    @column()
    public userId: number
    
    @column()
    public categoryId: number
    
    @column()
    public name: string
    
    @column()
    public slug: string
    
    @attachment({ preComputeUrl: true })
    public image: AttachmentContract
    
    @column()
    public stock: number
    
    @column()
    public available: number
    
    @column()
    public status: string

    @column()
    public maps: string
    
    @column.dateTime({ autoCreate: true })
    public createdAt: DateTime
  
    @column.dateTime({ autoCreate: true, autoUpdate: true })
    public updatedAt?: DateTime

    @belongsTo(() => User)
    public user: BelongsTo<typeof User>

    @belongsTo(() => Category)
    public category: BelongsTo<typeof Category>

    @hasMany(() => Checkout)
    public checkouts: HasMany<typeof Checkout>
}

