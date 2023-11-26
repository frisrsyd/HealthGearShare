import { DateTime } from 'luxon';
import Category from 'App/Models/Category';
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Tool from 'App/Models/Tool'
import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite';

export default class ToolsController {
  public async index({}: HttpContextContract) {}

  public async create({}: HttpContextContract) {}

  public async store({request, response, session, auth}: HttpContextContract) {
    const tool = new Tool()
    const data = request.only(['toolName', 'category', 'categoryText' ,'stock', 'maps'])
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
      slug = slug + '-' + DateTime.now()
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


    const tool_ref = await Tool.create({
      name: toolName,
      image: tool.image, 
      userId: auth.user?.id,
      slug: slug,
      categoryId: category_id, 
      stock: tool.stock, 
      available: tool.available, 
      status: status,
      maps: data.maps
    })
    // await tool.save()
    
    if (tool_ref) {
      session.flash('status', 'Alat berhasil ditambahkan')
    }
    else {
      session.flash('error', 'Alat gagal ditambahkan')
    }

    return response.redirect().toRoute('/add-tool')
  }

  public async show({}: HttpContextContract) {}

  public async edit({view, params}: HttpContextContract) {
    const tool = await Tool.findByOrFail('slug', params.slug)
    tool.load('category')
    const category = await Category.all()
    let statusPeminjaman = ""
    let classStatus = ""
    if(tool.stock == tool.available){
      statusPeminjaman = "Alat Tidak Sedang Dipinjam"
      classStatus = "alert-success"
    }else{
      statusPeminjaman = "Alat Sedang Dipinjam"
      classStatus = "alert-danger"
    }
    return view.render('page/tool/edit-tool', {tool: tool, category: category, statusPeminjaman: statusPeminjaman, classStatus: classStatus})
  }

  public async update({ request, response, session, params }: HttpContextContract) {
    const tool = await Tool.findByOrFail('slug', params.slug)
    const data = request.only(['toolName', 'category', 'categoryText' ,'stock', 'maps'])
    if (data.categoryText != null) {
      data.category = data.categoryText
    }
    const toolName = data.toolName
    const categoryName = data.category
    let categorySlug
    let slug = tool.slug

    let image = request.file('image')!
    let status

    const stock = data.stock = parseInt(data.stock)
    let available = tool.available
    let dipinjam = tool.stock - tool.available
    available = stock - dipinjam
    
    if(toolName != null && categoryName != null){
      categorySlug = data.category = data.category.toLowerCase().replace(/ /g, '-')
    }

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
    
    // check if image is null, if null get image from database
    if (image == null) {
      const getImage = await Tool.findByOrFail('id', tool.id)
      tool.image = getImage.image
    } else {
      tool.image = Attachment.fromFile(image)
    }
    tool.name = toolName
    tool.slug = slug
    tool.stock = stock
    tool.available = available
    tool.status = status
    tool.categoryId = category_id
    tool.maps = data.maps
    
    // updateOrCreate data from slug in tools table


    if(tool.stock == tool.available){
      await tool.save()
    }else{
      session.flash('error', 'Alat sedang dipinjam')
      //redirect to current page if tool in use
      return response.redirect().back()
    }
    
    session.flash('status', 'Alat berhasil disimpan')
    
    return response.redirect().toRoute('/akun')

  }

  public async destroy({response, session, params}: HttpContextContract) {
    const tool = await Tool.findByOrFail('slug', params.slug)
    if (tool) {
      // make sure tool not in use
      if (tool.available == tool.stock) {
        tool.isActive = false
        await tool.save()
        session.flash('status', 'Alat berhasil dinonaktifkan')
      }
      else {
        session.flash('error', 'Alat sedang dipinjam')
        //redirect to current page if tool in use
        return response.redirect().back()
      }
    }
    else {
      session.flash('error', 'Alat gagal dinonaktifkan')
    }
    return response.redirect().toRoute('/akun')
  }
  public async activate({response, session, params}: HttpContextContract) {
    const tool = await Tool.findByOrFail('slug', params.slug)
    if (tool) {
      // make sure tool not in use
      if (tool.available == tool.stock) {
        tool.isActive = true
        await tool.save()
        session.flash('status', 'Alat berhasil diaktifkan')
      }
      else {
        session.flash('error', 'Alat sedang digunakan')
        //redirect to current page if tool in use
        return response.redirect().back()
      }
    }
    else {
      session.flash('error', 'Alat gagal diaktifkan')
    }
    return response.redirect().toRoute('/akun')
  }
}
