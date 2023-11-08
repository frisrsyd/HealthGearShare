/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('dashboard', async ({ auth }) => {
    await auth.use('web').authenticate()
  
    // ✅ Request authenticated
    console.log(auth.user!)
  })
  
Route.group(() => {
    
    //peminjaman barang
    Route.get('/detail-barang/:category_id', 'PagesController.detailBarang')
    Route.get('/data-peminjaman/:tool_id', 'PagesController.dataPeminjaman')
    Route.get('/rekap-peminjaman/:checkout_id', 'PagesController.rekapPeminjaman').as('rekap-peminjaman')
    Route.post('/checkouts/store/:tool_id', 'CheckoutsController.store').as('checkouts.store')

    //ubah status peminjaman
    Route.get('/detail-ubah-status/:checkout_id', 'PagesController.detailUbahStatus')
    Route.get('/detail-konfirmasi-peminjaman/:checkout_id', 'PagesController.konfirmasiPeminjaman')
    Route.post('/update-status/:checkout_id', 'CheckoutsController.updateStatusTerima').as('checkouts.update-status')
    Route.post('/tolak-status/:checkout_id', 'CheckoutsController.updateStatusTolak').as('checkouts.tolak-status')
    Route.post('/konfirmasi-peminjaman/:checkout_id', 'CheckoutsController.konfirmasiPeminjaman').as('checkouts.konfirmasi-peminjaman')

    //pengembalian barang
    Route.get('/sedang-dipinjam', 'PagesController.sedangDipinjam')
    Route.get('/detail-peminjaman/:checkout_id', 'PagesController.detailPeminjaman')
    Route.post('/checkouts/update/:checkout_id', 'CheckoutsController.update').as('checkouts.update')

    //riwayat peminjaman
    Route.get('/riwayat-peminjaman', 'PagesController.riwayatPeminjaman')
    Route.get('/detail-riwayat', 'PagesController.detailRiwayat')

    //Category
    Route.post('/categories/store', 'CategoriesController.store').as('categories.store')

    //tool
    Route.get('/add-tool', 'PagesController.addTool')
    Route.post('/tools/store', 'ToolsController.store').as('tools.store')

    //logout
    Route.post('/logout', 'LoginController.logout').as('logout')

    
    
    //account
    Route.get('/akun', 'PagesController.akun')
}).middleware('auth')

//home route
Route.get('/', 'PagesController.home')
Route.get('/home', 'PagesController.home')

//auth route
Route.get('/login', 'PagesController.login')
Route.get('/signup', 'PagesController.signUp')
Route.get('/forgot-password', 'PagesController.forgotPassword')
Route.post('/register/store', 'RegistersController.store').as('register.store')
Route.post('/login', 'LoginController.login').as('login')



