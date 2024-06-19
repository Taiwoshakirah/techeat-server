const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
require ('dotenv').config()
port = 3000

const authRouter = require('./routes/authRouter')
const subRouter = require('./routes/subRouter')
const discountRouter = require('./routes/discountRouter')
const contactUsRouter = require('./routes/contactUsRouter')

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api", subRouter);
app.use("/api", discountRouter);
app.use("/api", contactUsRouter);


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