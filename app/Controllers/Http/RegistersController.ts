import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { isValidNIK } from 'nusantara-valid'
import { isValidNIKWithComparison } from 'nusantara-valid'
import User from 'App/Models/User'

export default class RegistersController {

    public async store ({request, response, session}: HttpContextContract) {
        // register a new user
        const data = request.only(['name', 'role' ,'email', 'npm', 'password', 'passwordConfirmation', 'tgl_lahir'])
        
        if(data.password != data.passwordConfirmation){
            session.flash('error', 'Password tidak sama')
            return response.redirect('/signup')
        }
        if(isValidNIK(data.npm) == false){
            session.flash('error', 'NIK tidak valid')
            return response.redirect('/signup')
        }else if(isValidNIKWithComparison(data.npm, {
            birthday: data.tgl_lahir
        }) == false){
            session.flash('error', 'NIK dan tanggal lahir tidak sesuai')
            return response.redirect('/signup')
            // return getDataNIK(data.npm)
            // return data.tgl_lahir
        }
        const user = await User.create({
            name: data.name,
            email: data.email,
            nik: data.npm,
            password: data.password
        })
        if (user) {
            session.flash('status', 'akun berhasil dibuat')
            return response.redirect('/login')
        }
        else {
            session.flash('error', 'Akun gagal ditambahkan')
            return response.redirect('/signup')
        }
        
    }
}
