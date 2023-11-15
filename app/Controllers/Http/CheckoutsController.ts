import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Checkout from 'App/Models/Checkout'
import Tool from 'App/Models/Tool'
import User from 'App/Models/User'

export default class CheckoutsController {
    public async store({request, response, params, auth, session}: HttpContextContract) {
        const data = request.only(['toolId', 'jumlahPeminjaman', 'tglMulai', 'tglKembali', 'tujuanPeminjaman'])
        const tool = await Tool.findByOrFail('id', params.tool_id)
        const user = await User.findByOrFail('id', auth.user?.id)

        let status = ''
        
        let available = tool.available - data.jumlahPeminjaman
        if (available > 0 ) {
            status = 'Tersedia'
        } else if(available == 0) {
            status = 'Tidak Tersedia'
        }else{
            return session.flash('status', 'Jumlah alat yang tersedia tidak mencukupi')
        }

        const updateTool = await Tool.updateOrCreate({
            id: tool.id
        }, {
            status: status,
            available: available
        })

        let checkoutStatus = 'Menunggu Persetujuan'

        const checkout = await Checkout.create({
            toolId: tool.id,
            userId: user.id,
            quantity: data.jumlahPeminjaman,
            status: checkoutStatus,
            startDate: data.tglMulai,
            endDate: data.tglKembali,
            purpose: data.tujuanPeminjaman
        })
        if (updateTool) {
            if(checkout) {
                session.flash('status', 'Berhasil mengajukan peminjaman alat')
                return response.redirect().toRoute('rekap-peminjaman', { checkout_id: checkout.id })
            } else {
                session.flash('status', 'Gagal mengajukan peminjaman alat(checkout)')
            }
        } else {
            session.flash('status', 'Gagal mengajukan peminjaman alat(updateTool)')
        }
    }

    public async update({response, params, session}: HttpContextContract) {
        const checkout = await Checkout.findByOrFail('id', params.checkout_id)
        const tool = await Tool.findByOrFail('id', checkout.toolId)

        let status = ''
        
        let available = tool.available + checkout.quantity
        if (available > 0 ) {
            status = 'Tersedia'
        } else {
            status = 'Tidak Tersedia'
        }

        const updateTool = await Tool.updateOrCreate({
            id: tool.id
        }, {
            status: status,
            available: available
        })

        const updateCheckout = await Checkout.updateOrCreate({
            id: checkout.id
        }, {
            status: 'Dikembalikan'
        })
        if (updateTool) {
            if(updateCheckout) {
                session.flash('status', 'Berhasil menembalikan barang')
                return response.redirect().toRoute('rekap-peminjaman', { checkout_id: checkout.id })
            } else {
                session.flash('status', 'Gagal mengembalikan barang(updateCheckout)')
            }
        } else {
            session.flash('status', 'Gagal mengembalikan barang(updateTool)')
        }
    }

    public async updateStatusTerima({response, params, session}: HttpContextContract) {
        const checkout = await Checkout.findByOrFail('id', params.checkout_id)

        const updateCheckout = await Checkout.updateOrCreate({
            id: checkout.id
        }, {
            status: 'Belum Diambil'
        })

        if(updateCheckout) {
            session.flash('status', 'Berhasil menyetujui peminjaman')
        } else {
            session.flash('status', 'Gagal menerima pinjaman(updateCheckout)')
        }
        return response.redirect().toRoute('/akun')
    }

    public async updateStatusTolak({response, params, session}: HttpContextContract) {
        const checkout = await Checkout.findByOrFail('id', params.checkout_id)
        const tool = await Tool.findByOrFail('id', checkout.toolId)

        const updateCheckout = await Checkout.updateOrCreate({
            id: checkout.id
        }, {
            status: 'Ditolak'
        })

        let status = ''
        let available = tool.available + checkout.quantity
        if (available > 0 ) {
            status = 'Tersedia'
        } else {
            status = 'Tidak Tersedia'
        }

        const updateTool = await Tool.updateOrCreate({
            id: tool.id
        }, {
            status: status,
            available: available
        })
        if(updateCheckout) {
            if(updateTool) {
            session.flash('status', 'Peminjaman ditolak')
            } else {
                session.flash('status', 'Gagal menolak pinjaman(updateTool)')
            }
        } else {
            session.flash('status', 'Gagal menolak pinjaman(updateCheckout)')
        }
        return response.redirect().toRoute('/akun')
    }
    
    public async konfirmasiPeminjaman({response, params, session}: HttpContextContract) {
        const checkout = await Checkout.findByOrFail('id', params.checkout_id)

        const updateCheckout = await Checkout.updateOrCreate({
            id: checkout.id
        }, {
            status: 'Dipinjam'
        })

        if(updateCheckout) {
            session.flash('status', 'Konfirmasi peminjaman berhasil')
        } else {
            session.flash('status', 'Konfirmasi peminjaman gagal(updateCheckout)')
        }
        return response.redirect().toRoute('/akun')
    }
}
