import Category from 'App/Models/Category';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tool from 'App/Models/Tool'
import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite';

export default class ToolsController {
  public async index({}: HttpContextContract) {}

  public async create({}: HttpContextContract) {}

  public async store({request, response, session, auth}: HttpContextContract) {
    const tool = new Tool()
    const data = request.only(['toolName', 'category', 'categoryText' ,'stock'])
    if (data.categoryText != null) {
      data.category = data.categoryText
    }
    const toolName = data.toolName
    const categoryName = data.category
    let categorySlug
    let slug
    if(toolName != null && categoryName != null){
      categorySlug = data.category = data.category.toLowerCase().replace(/ /g, '-')
      slug = data.toolName = data.toolName.toLowerCase().replace(/ /g, '-')
    }
    let image = request.file('image')!
    let status

    const stock = data.stock = parseInt(data.stock)
    const available = stock
    
    
    await Category.firstOrCreate({name: categoryName}, {slug: categorySlug})
    const getCategory = await Category.findByOrFail('slug', categorySlug)
    const category_id = getCategory.id

    const getImage = await Tool.findBy('slug', slug)
    if (getImage) {
      tool.stock = getImage.stock + stock
      tool.available = getImage.available + stock
      status = getImage.status
      if (tool.available == 0) {
        status = 'Tidak tersedia'
      }
      else {
        status = 'Tersedia'
      }
    }else{
      tool.stock = stock
      tool.available = available
      status = tool.status
      if (available == 0) {
        status = 'Tidak tersedia'
      } else {
        status = 'Tersedia'
      }
    }
    
    tool.image = Attachment.fromFile(image)
    // tool.name = toolName
    // tool.slug = slug
    // tool.stock = stock
    // tool.available = available
    // tool.status = status
    // tool.category_id = category_id
    
    // updateOrCreate data from slug in tools table

    

    const tool_ref = await Tool.updateOrCreate({slug: slug}, {
      name: toolName,
      image: tool.image, 
      userId: auth.user?.id,
      slug: slug,
      categoryId: category_id, 
      stock: tool.stock, 
      available: tool.available, 
      status: status})
    // await tool.save()
    
    if (tool_ref) {
      session.flash('status', 'Alat berhasil ditambahkan')
    }
    else {
      session.flash('status', 'Alat gagal ditambahkan')
    }

    return response.redirect().toRoute('/add-tool')
  }

  public async show({}: HttpContextContract) {}

  public async edit({}: HttpContextContract) {}

  public async update({}: HttpContextContract) {
  }

  public async destroy({}: HttpContextContract) {}
}
