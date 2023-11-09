import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User'
import Hash from '@ioc:Adonis/Core/Hash'

export default class LoginController {
    public async login({request, response, auth, session}: HttpContextContract){
        const data = request.only(['npm', 'password'])
    
        try {
            // Lookup user manually
            const user = await User.query()
              .where('nik', data.npm)
              .firstOrFail();
        
            // Verify password
            const passwordVerified = await Hash.verify(user.password, data.password);
            if (!passwordVerified) {
              session.flash('status', 'Invalid nik or password');
              return response.redirect('/login');
            }
        
            // Create session
            await auth.use('web').login(user);
            session.flash('status', 'Login berhasil');
            return response.redirect('/home');
        } catch (error) {
            session.flash('status', 'Invalid nik or password');
            return response.redirect('/login');
        }
    }

    public async logout({auth, response, session}: HttpContextContract){
        await auth.use('web').logout()
        session.flash('status', 'Logout berhasil')
        return response.redirect('/login')
    }
}
