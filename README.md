<br>
<h1 align="center">HealthGearShare</h1>
<br>

## About HealthGearShare

<p>HealthGearShare is a web application that allows people to have medical portable tool for a time without buy it, just borrow or rent it. The application is designed to be used by people who are in need of medical services.</p>

## Installation

1. clone the repository

```bash
git clone https://github.com/frisrsyd/HealthGearShare
```

2. go to folder and run

```bash
npm install
```

3. migrate the table

Copy the contents of `.env.example` file to new `.env` file:

```sh
cp .env.example .env
```

jika error jalankan

```sh
copy .env.example .env
```

Create an application encryption key:

```sh
node ace generate:key
```

ubah bagian APP_KEY di file .env dengan hasil generate:key

Create an empty database and fill in the `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DB_NAME`, `MYSQL_USER` and `MYSQL_PASSWORD` fields in the `.env` file to match the credentials of your newly created database.

following the .env file, change `MYSQL_DB_NAME = healthgearshare`, so make the empty database name is `healthgearshare`

Run the migrations:

```sh
node ace migration:run
```

4. run serve with

```bash
node ace serve --watch
```

## Contact info

if any problem contact whatsapp

```bash
https://api.whatsapp.com/send?phone=6285261297134
```
