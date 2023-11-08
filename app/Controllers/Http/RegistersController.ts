import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'

export default class RegistersController {

    public async store ({request, response, session}: HttpContextContract) {
        // register a new user
        const data = request.only(['name', 'role' ,'email', 'npm', 'password', 'passwordConfirmation'])
        
        if(data.password != data.passwordConfirmation){
            session.flash('password-status', 'Password tidak sama')
            return response.redirect('/signup')
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
            session.flash('status', 'Akun gagal ditambahkan')
            return response.redirect('/signup')
        }
        
    }
}
