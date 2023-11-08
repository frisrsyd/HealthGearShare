import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Category from 'App/Models/Category'

export default class CategoriesController {
    public async store({ request } : HttpContextContract) {
        const data = request.only(['name', 'slug'])

        const category = await Category.create(data)

        return category
    }
}
