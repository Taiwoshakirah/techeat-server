const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const app = express()
require ('dotenv').config()
port = 3000

const authRouter = require('./routes/authRouter')
const subRouter = require('./routes/subRouter')
const discountRouter = require('./routes/discountRouter')
const contactUsRouter = require('./routes/contactUsRouter')
const vendorRouter = require('./routes/vendorRouter')
const reviewRouter = require('./routes/reviewRouter')
const cartRouter = require('./routes/cartRouter')


app.use(cors());
app.use(express.json());
app.use(cookieParser())
app.use("/api/auth", authRouter);
app.use('/api/vendor',vendorRouter)
app.use("/api", subRouter);
app.use("/api", discountRouter);
app.use("/api", contactUsRouter);
app.use('/api/review',reviewRouter)
app.use('/api/products', cartRouter)



const start =async ()=>{
   try {
    const conn =await mongoose.connect(process.env.MONGO_URI)
    console.log('DB Connected');
    app.listen(port,()=>{
        console.log(`Server is listening on http://localhost:${port}`);
    })
   } catch (error) {
    console.log(`Could not connect due to ${error.message}`);
   }
}
start()