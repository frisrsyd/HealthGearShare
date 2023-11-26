import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Checkout from 'App/Models/Checkout'
import Tool from 'App/Models/Tool'
import User from 'App/Models/User'

export default class CheckoutsController {
    public async store({request, response, params, auth, session}: HttpContextContract) {
        const data = request.only(['toolId', 'jumlahPeminjaman', 'tglMulai', 'tglKembali', 'tujuanPeminjaman'])
        const tool = await Tool.findByOrFail('id', params.tool_id)
        const user = await User.findByOrFail('id', auth.user?.id)
        
        let available = tool.available - data.jumlahPeminjaman
        if (available < 0 ) {
            session.flash('status', 'Jumlah alat yang tersedia tidak mencukupi')
            return response.redirect().toRoute('data-peminjaman', { tool_id: tool.id })
        }

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

        if(checkout) {
            session.flash('status', 'Berhasil mengajukan peminjaman alat')
            return response.redirect().toRoute('rekap-peminjaman', { checkout_id: checkout.id })
        } else {
            session.flash('error', 'Gagal mengajukan peminjaman alat(checkout)')
            return response.redirect().toRoute('data-peminjaman', { tool_id: tool.id })
        }
    }

    public async update({response, params, session}: HttpContextContract) {
        const checkout = await Checkout.findByOrFail('id', params.checkout_id)

        const updateCheckout = await Checkout.updateOrCreate({
            id: checkout.id
        }, {
            status: 'Belum Diantar'
        })

        if(updateCheckout) {
            session.flash('status', 'Berhasil mengajukan pengembalian barang')
            return response.redirect().toRoute('rekap-peminjaman', { checkout_id: checkout.id })
        } else {
            session.flash('error', 'Gagal mengajukan pengembalian barang(updateCheckout)')
        }
        
    }

    public async updateStatusTerima({response, params, session}: HttpContextContract) {
        const checkout = await Checkout.findByOrFail('id', params.checkout_id)

        const tool = await Tool.findByOrFail('id', checkout.toolId)

        let status = ''
        let available = tool.available - checkout.quantity
        if (available > 0 ) {
            status = 'Tersedia'
        } else if (available == 0) {
            status = 'Tidak Tersedia'
        }else {
            session.flash('error', 'Jumlah alat yang tersedia tidak mencukupi')
            return response.redirect().toRoute('checkouts.detail-ubah-status', { checkout_id: checkout.id })
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
            status: 'Belum Diambil'
        })

        if(updateCheckout) {
            if(updateTool) {
            session.flash('status', 'Berhasil menyetujui peminjaman')
            } else {
                session.flash('error', 'Gagal menerima pinjaman(updateTool)')
            }
        } else {
            session.flash('error', 'Gagal menerima pinjaman(updateCheckout)')
        }
        return response.redirect().toRoute('/akun')
    }

    public async updateStatusTolak({response, params, session}: HttpContextContract) {
        const checkout = await Checkout.findByOrFail('id', params.checkout_id)

        const updateCheckout = await Checkout.updateOrCreate({
            id: checkout.id
        }, {
            status: 'Ditolak'
        })

       
        if(updateCheckout) {
            session.flash('status', 'Peminjaman ditolak')
        } else {
            session.flash('error', 'Gagal menolak pinjaman(updateCheckout)')
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
            session.flash('error', 'Konfirmasi peminjaman gagal(updateCheckout)')
        }
        return response.redirect().toRoute('/akun')
    }
    public async konfirmasiPengembalian({response, params, session}: HttpContextContract) {
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
            status: 'Dikembalikan',
        })

        if(updateTool) {
            if(updateCheckout) {
                session.flash('status', 'Konfirmasi pengembalian berhasil')
            } else {
                session.flash('error', 'Konfirmasi pengembalian gagal(updateCheckout)')
            }
        } else {
            session.flash('error', 'Konfirmasi pengembalian gagal(updateTool)')
        }
        return response.redirect().toRoute('/akun')
    }
}
