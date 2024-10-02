import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"



const app = express()


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    allowedHeaders: true
}))

app.use(express.json({limit: 3e7}))
app.use(express.urlencoded({limit: 3e7, extended: false}))
app.use(express.static("public"))
app.use(cookieParser())


import userRouter from './routes/user.routes.js'
import productRouter from './routes/product.routes.js'
import orderRouter from './routes/order.routes.js'
import categoryRouter from './routes/category.routes.js'
import addressRouter from './routes/address.routes.js'


app.use("/api/v2/user", userRouter)
app.use("/api/v2/products", productRouter)
app.use("/api/v2/orders", orderRouter)
app.use("/api/v2/categorys", categoryRouter)
app.use("/api/v2/addresses", addressRouter)


export  { app }