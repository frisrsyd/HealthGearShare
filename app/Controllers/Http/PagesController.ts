import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Category from 'App/Models/Category'
import Checkout from 'App/Models/Checkout'
import Tool from 'App/Models/Tool'
import User from 'App/Models/User'

export default class PagesController {

    public async home({ view, request }: HttpContextContract) {
        //search category with user input
        if (request.input('search')) {
            const category = await Category.query().where('name', 'like', '%' + request.input('search') + '%')
            if (category.length == 0) {
                return view.render('page/home', { 'error': 'Kategori tidak ditemukan' })
            }
            return view.render('page/home', { 'categories': category })
        }
        const category = await Category.all()
        
        if (category.length == 0) {
            return view.render('page/home', { 'error': 'Kategori tidak ditemukan' })
        }
        return view.render('page/home', { 'categories': category })
    }

    public async detailBarang({ view, params, request }: HttpContextContract) {
        // find tool where category_id = category.id and status = 'Tersedia'
        let tool = await Tool.query().where('status', 'Tersedia').andWhere('is_active', true).preload('user').preload('category')
        tool = tool.filter((item) => {
            // use params.slug
            return item.category.slug === params.slug
        })
        if (tool.length == 0) {
            return view.render('page/peminjaman-barang/detail-barang', { 'error': 'Barang tidak ditemukan' })
        }
        //search tool with user input
        if (request.input('search')) {
            tool = tool.filter((item) => {
                return item.name.toLowerCase().includes(request.input('search').toLowerCase())
            })
            if (tool.length == 0) {
                return view.render('page/peminjaman-barang/detail-barang', { 'error': 'Barang tidak ditemukan' })
            }
            return view.render('page/peminjaman-barang/detail-barang', { 'tools': tool })
        }
        return view.render('page/peminjaman-barang/detail-barang', { 'tools': tool })
    }

    public async dataPeminjaman({ view, params }: HttpContextContract) {
        const tool = await Tool.findBy('slug', params.slug)
        if(tool != null){
            if(tool.isActive){
                if(tool.status == 'Tersedia'){
                    return view.render('page/peminjaman-barang/data-peminjaman', { 'tools': tool })
                }else{
                    return view.render('page/peminjaman-barang/detail-barang', { 'error': 'Barang tidak tersedia atau sudah tidak dipinjamkan lagi' })
                }
            }else{
                return view.render('page/peminjaman-barang/detail-barang', { 'error': 'Barang tidak tersedia atau sudah tidak dipinjamkan lagi' })
            }
        }else{
            return view.render('page/peminjaman-barang/detail-barang', { 'error': 'Barang tidak ditemukan' })
        }
    }

    public async rekapPeminjaman({ view, params }: HttpContextContract) {
        const checkout = await Checkout.findBy('id', params.checkout_id)
        await checkout?.load('tool')
        await checkout?.load('user')
        const userTool = await User.findBy('id', checkout?.tool.userId)
        // change the format of the date
        let noPinjam = checkout?.createdAt.toFormat('dd/MM/yyyy')
        noPinjam = checkout?.tool.name.toUpperCase().replace(/ /g, '_') + '/' + noPinjam + '/' + checkout?.id
        const startDate = checkout?.startDate.toFormat('dd/MM/yyyy')
        const endDate = checkout?.endDate.toFormat('dd/MM/yyyy')
        if (checkout == null) {
            return view.render('page/peminjaman-barang/rekap-peminjaman', { 'error': 'Tidak ada barang yang sedang dipinjam' })
        }
        return view.render('page/peminjaman-barang/rekap-peminjaman', { 'checkouts': checkout, 'noPinjam': noPinjam , 'startDate': startDate, 'endDate': endDate, 'userTool': userTool })
    }

    public async sedangDipinjam({ view, auth, request }: HttpContextContract) {
        const user_id = auth.user?.id ?? 0;
        
        let query = await Checkout
        .query()
        .where('userId', user_id)
        .preload('tool');

        if(request.input('search')){
            const checkout = query.filter((item) => {
                return item.tool.name.toLowerCase().includes(request.input('search').toLowerCase()) && (item.status == 'Dipinjam' || item.status == 'Belum Diambil')
            })
            if (checkout.length == 0) {
                return view.render('page/pengembalian-barang/sedang-dipinjam', { 'error': 'Tidak ada barang yang sedang dipinjam' })
            }
            
            return view.render('page/pengembalian-barang/sedang-dipinjam', { 'checkouts': checkout })
        }

        const checkout = query.filter((item) => {
            return item.status == 'Dipinjam' || item.status == 'Belum Diambil'
        })
        
        if (checkout.length == 0) {
            return view.render('page/pengembalian-barang/sedang-dipinjam', { 'error': 'Tidak ada barang yang sedang dipinjam' })
        }
        return view.render('page/pengembalian-barang/sedang-dipinjam', { 'checkouts': checkout })
    }

    public async detailPeminjaman({ view, params }: HttpContextContract) {
        const checkout = await Checkout.findBy('id', params.checkout_id)
        await checkout?.load('tool')
        await checkout?.load('user')
        let noPinjam = checkout?.createdAt.toFormat('dd/MM/yyyy')
        noPinjam = checkout?.tool.name.toUpperCase().replace(/ /g, '_') + '/' + noPinjam + '/' + checkout?.id
        const startDate = checkout?.startDate.toFormat('dd/MM/yyyy')
        const endDate = checkout?.endDate.toFormat('dd/MM/yyyy')

        if (checkout == null) {
            return view.render('page/pengembalian-barang/detail-peminjaman', { 'error': 'Tidak ada barang yang sedang dipinjam' })
        }
        return view.render('page/pengembalian-barang/detail-peminjaman', { 'checkouts': checkout, 'noPinjam': noPinjam , 'startDate': startDate, 'endDate': endDate })
    }

    public async riwayatPeminjaman({ view, auth, request }: HttpContextContract) {
        const user_id = auth.user?.id ?? 0;
        // find checkout where status = 'Dipinjam' or 'Belum Diambil' with findBy
        const query = await Checkout.query().where('userId', user_id).preload('tool').preload('user')
        // search checkout with user input
        if (request.input('search')) {
            const checkout = query.filter((item) => {
                return item.tool.name.toLowerCase().includes(request.input('search').toLowerCase()) && item.status == 'Dikembalikan'
            })
            if (checkout.length == 0) {
                return view.render('page/riwayat-peminjaman/riwayat-peminjaman', { 'error': 'Tidak ada barang yang pernah dipinjam' })
            }
            return view.render('page/riwayat-peminjaman/riwayat-peminjaman', { 'checkouts': checkout })
        }
        // filter checkout where status = 'Dikembalikan'
        let endDate:Array<string> = []
        const checkout = query.filter((item) => {
            endDate.push(item.updatedAt.toFormat('dd/MM/yyyy'))
            return item.status == 'Dikembalikan'
        })
        // change the format of the date
        
        
        
        if (checkout.length == 0) {
            return view.render('page/riwayat-peminjaman/riwayat-peminjaman', { 'error': 'Tidak ada barang yang pernah dipinjam' })
        }

        return view.render('page/riwayat-peminjaman/riwayat-peminjaman', { 'checkouts': checkout, 'endDate': endDate})
    }
    
    public async detailRiwayat({ view, params }: HttpContextContract) {
        const checkout = await Checkout.findBy('id', params.checkout_id)
        await checkout?.load('tool')
        await checkout?.load('user')

        const tool = await Tool.findBy('id', checkout?.toolId)
        await tool?.load('user')
    
        let noPinjam = checkout?.createdAt.toFormat('dd/MM/yyyy')
        noPinjam = checkout?.tool.name.toUpperCase().replace(/ /g, '_') + '/' + noPinjam + '/' + checkout?.id
        const startDate = checkout?.startDate.toFormat('dd/MM/yyyy')
        const endDate = checkout?.endDate.toFormat('dd/MM/yyyy')

        if (checkout == null) {
            return view.render('page/riwayat-peminjaman/detail-riwayat', { 'error': 'Tidak ada barang yang pernah dipinjam' })
        }
        return view.render('page/riwayat-peminjaman/detail-riwayat', { 'tool': tool, 'checkout': checkout, 'noPinjam': noPinjam , 'startDate': startDate, 'endDate': endDate })
    }

    public async login({ view }: HttpContextContract) {
        return view.render('page/account/login')
    }

    public async signUp({ view }: HttpContextContract) {
        return view.render('page/account/sign-up')
    }

    public async forgotPassword({ view }: HttpContextContract) {
        return view.render('page/account/forgot-password')
    }

    public async akun({ view, auth }: HttpContextContract) {
        const user = await User.findBy('id', auth.user?.id)
        const checkout = await Checkout.query().where('status', 'Belum Diambil').preload('tool').preload('user')
        const pengembalian = await Checkout.query().where('status', 'Belum Diantar').preload('tool').preload('user')
        const ditolak = await Checkout.query().where('status', 'Ditolak').preload('tool').preload('user')
        let waiting = await Checkout.query().where('status', 'Menunggu Persetujuan').preload('tool').preload('user')
        const myTool = await Tool.query().preload('category').preload('user')
        waiting = waiting.sort((a, b) => {
            return b.createdAt > a.createdAt ? -1 : 1
        })
        let isActive = ""
        for (let i = 0; i < myTool.length; i++) {
            if (myTool[i].isActive == true) {
                isActive = "Aktif"
            }
            else{
                isActive = "Tidak Aktif"
            }
        }

        return view.render('page/account/akun', { 'users': user, 'checkouts': checkout, 'pengembalian': pengembalian, 'ditolak': ditolak, 'waiting': waiting, 'myTool': myTool, 'isActive': isActive })
    }

    public async addTool({ view }: HttpContextContract) {
        const category = await Category.all()
        return view.render('page/tool/add-tool', { 'categories': category })
    }
    
    public async detailUbahStatus({ view, params }: HttpContextContract) {
        const checkout = await Checkout.findBy('id', params.checkout_id)
        await checkout?.load('tool')
        await checkout?.load('user')
        let noPinjam = checkout?.createdAt.toFormat('dd/MM/yyyy')
        noPinjam = checkout?.tool.name.toUpperCase().replace(/ /g, '_') + '/' + noPinjam + '/' + checkout?.id
        const startDate = checkout?.startDate.toFormat('dd/MM/yyyy')
        const endDate = checkout?.endDate.toFormat('dd/MM/yyyy')

        if (checkout == null) {
            return view.render('page/peminjaman-barang/detail-ubah-status', { 'error': 'Tidak ada barang yang sedang dipinjam' })
        }
        return view.render('page/peminjaman-barang/detail-ubah-status', { 'checkouts': checkout, 'noPinjam': noPinjam , 'startDate': startDate, 'endDate': endDate })
    }

    public async konfirmasiPeminjaman({ view, params }: HttpContextContract) {
        const checkout = await Checkout.findBy('id', params.checkout_id)
        await checkout?.load('tool')
        await checkout?.load('user')
        const userTool = await User.findBy('id', checkout?.tool.userId)
        let noPinjam = checkout?.createdAt.toFormat('dd/MM/yyyy')
        noPinjam = checkout?.tool.name.toUpperCase().replace(/ /g, '_') + '/' + noPinjam + '/' + checkout?.id
        const startDate = checkout?.startDate.toFormat('dd/MM/yyyy')
        const endDate = checkout?.endDate.toFormat('dd/MM/yyyy')

        if (checkout == null) {
            return view.render('page/peminjaman-barang/detail-konfirmasi-peminjaman', { 'error': 'Tidak ada barang yang sedang dipinjam' })
        }
        return view.render('page/peminjaman-barang/detail-konfirmasi-peminjaman', { 'checkouts': checkout, 'noPinjam': noPinjam , 'startDate': startDate, 'endDate': endDate, 'userTool': userTool })
    }
    
    public async konfirmasiPengembalian({ view, params }: HttpContextContract) {
        const checkout = await Checkout.findBy('id', params.checkout_id)
        await checkout?.load('tool')
        await checkout?.load('user')
        const userTool = await User.findBy('id', checkout?.tool.userId)
        let noPinjam = checkout?.createdAt.toFormat('dd/MM/yyyy')
        noPinjam = checkout?.tool.name.toUpperCase().replace(/ /g, '_') + '/' + noPinjam + '/' + checkout?.id
        const startDate = checkout?.startDate.toFormat('dd/MM/yyyy')
        const endDate = checkout?.endDate.toFormat('dd/MM/yyyy')

        if (checkout == null) {
            return view.render('page/pengembalian-barang/detail-konfirmasi-pengembalian', { 'error': 'Tidak ada barang yang sedang dipinjam' })
        }
        return view.render('page/pengembalian-barang/detail-konfirmasi-pengembalian', { 'checkouts': checkout, 'noPinjam': noPinjam , 'startDate': startDate, 'endDate': endDate, 'userTool': userTool })
    }
}
