# Delhi Wala Halwai 
This is the official web app for **Delhi Wala Halwai**, a premium sweets and snacks brand.
Basic layout for wht the website will look like 
── layout.tsx # Main layout with Navbar & Footer and sign in and signout 
├── page.tsx # Homepage
├── menu/ # Menu of all sweets
├── cart/ # Shopping cart
├── checkout/ # Checkout page
├── product/[id]/ # Individual product view
├── dashboard/ # Admin panel
│ ├── layout.tsx
│ ├── products/new/ # New product upload page
│ ├── products/[id]/ # Edit product
│ └── orders/ # Orders dashboard


**These are the models wht i think we will be needing**
models/
├── user.model.ts
├── product.model.ts
├── order.model.ts
├── category.model.ts

 # MongoDB connection (to be added)
==> This is not neccesary middleware.ts # Auth protection (to be added) 


--
