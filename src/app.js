import express from "express"



const app = express()


// app.use(cors({

// }))

app.use(express.json())
app.use(express.urlencoded({ extended: false}))
app.use(express.static("public"))
app.use(cookieParser())


import userRouter from './routes/user.routes.js'
import cookieParser from "cookie-parser"

app.use("/api/v2/user", userRouter)


export  { app }