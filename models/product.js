const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },

    price:{
        type:Number,
        required:true, 
    },

    image:{
        type:String,
        required:true,

    },
    description:{
        type:String,
    },
    available:{
        type:Boolean,
        default: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      },
      quantity: {
        type: Number,
        required: true,
        default: 0
      }
})

module.exports = mongoose.model('Products',productSchema)