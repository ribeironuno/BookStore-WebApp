<p align="center">
<img src="https://i.pinimg.com/736x/b2/38/01/b238018c0a4861898f3f44f78ce3eb2c.jpg" alt="Logo" width="300" />
</p>

# BookStore - Grupo 13


## Index

- [BookStore - Grupo 13](#bookstore---grupo-13)
  - [Index](#index)
  - [Purpose](#purpose)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Chrome extension](#chrome-extension)
  - [Instructions](#instructions)
  - [Test accounts](#test-accounts)
  - [Key words](#key-words)
  - [Authors](#authors)
  - [License](#license)


## Purpose
The purpose of this project begins with the subject of **Programação em Ambiente Web** where the main goal is to make students apply and explore the client-server model, create web applications by using a series of languages and frameworks, such as: JavaScript, TypeScript, HTML, CSS, MongoShell, framework Angular and template engine EJS. To achieve this goals, the project is based on creating a web application that manages a bookstore. 

## Backend

In the Backend folder is presented the project of the BackOffice of this bookstore. We manage the implementation of the Backend in the two milestones that compose this project.

On the first milestone, we created a employees, clients and books managements. We also achieved the main goal of this project which is the registration of purchases and sales. In addition the authentication and authorization was implemented, the user can define a fidelization program, view dozens of statistics, generate pdf invoices,...

On the second milestone, we focus our energies to integrate in the best way the work done by now with the new work (FrontOffice/Frontend). With that perspective, we implemented a newsletter service, the possibility to change information of the own store, create coupons, and the necessary modifications to embrace the sales and purchases coming from the new website.

## Frontend

The Frontend folder has the Angular project that has the main purpose of letting the client buy and sell books from their own house. The client can sell and buy books, subscribe to the newsletter of the bookstore, check the latest sales and purchases, edit their own profile, ... 

## Chrome extension

In order to make our website more competitive and attractive, we created a chrome extension that allows customers to easily search for a book in our bookstore and immediately know the price (if there is a book in the bookstore). 

All you need to install and run the chrome extension is on the README.md of the chrome extension folder. 


## Instructions

```bash
git clone https://github.com/ribeironuno/Librabry-WebApp
```

Open one terminal inside of repository folder

```
cd backend
npm install
npm start

```

Open another terminal inside of repository folder
```
cd frontend
npm install
ng serve

```

Open http://localhost:3000/admin to the BackOffice application.

Open http://localhost:4200/ to the FrontOffice application.

## Test accounts

Next there is a list of some valid account to experiment the app.

FrontOffice
  
- nunofaria@gmail.com store

- martasofia@gmail.com store

BackOffice
 
- admin@admin.com admin - (admin privileges)
- func@func.com func


## Key words
- Angular

- JavaScript

- TypeScript

- HTML

- CSS

- EJS

- Rest API

- Node.js

- Express.js

- Stripe API

- JWT Token

## Authors

- **Josué Freitas**
- **Nuno Ribeiro**

## License

[![License: Unlicense](https://img.shields.io/badge/license-Unlicense-blue.svg)](http://unlicense.org/)