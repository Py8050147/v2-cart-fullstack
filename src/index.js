import dotenv from "dotenv"
import { app } from "./app.js"

import connectDB from './db/index.js'

dotenv.config({
    path: './.env'
})

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`o server is running at port : ${process.env.PORT}`)
        })

    })
    .catch((error) => {
        console.log("MONGOdb connection failed !!!", error)
    })



// const app = express()
    
// dotenv.config({
//     path: './.env'
//     })
        // const PORT = process.env.PORT || 3000


//     (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         app.on("error", () => {
//             console.log('error', error)
//             throw error
//         })

//         app.listen(process.env.PORT, () => {
//             console.log(`server is on port ${process.env.PORT}`)
//         })
//     } catch (error) {
//         console.log(error)
//     }
// })()




