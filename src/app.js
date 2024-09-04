import express from "express"



const app = express()


// app.use(cors({

// }))

app.use(express.json())
app.use(express.urlencoded({ extended: false}))
app.use(express.static("public"))
app.use(cookieParser())


import userRouter from './routes/user.routes.js'
import productRouter from './routes/product.routes.js'
import orderRouter from './routes/order.routes.js'
import categoryRouter from './routes/category.routes.js'
import addressRouter from './routes/address.routes.js'

import cookieParser from "cookie-parser"

app.use("/api/v2/user", userRouter)
app.use("/api/v2/products", productRouter)
app.use("/api/v2/orders", orderRouter)
app.use("/api/v2/categorys", categoryRouter)
app.use("/api/v1/addresses", addressRouter)


export  { app }