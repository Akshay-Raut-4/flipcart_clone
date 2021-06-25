import mongoose from 'mongoose';


const ProductSchema= new mongoose.Schema({
    
    id: String,
    url: String,
     detailUrl: String,
     title:Object, 
    price: Object,
    description: String,
     discount: String, 
    tagline: String
})

const Products = mongoose.model('product',ProductSchema);

export default Products;