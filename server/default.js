import { products } from './constant/product.js'
import Products from './model/productSchema.js'

const DefaultData = async () => {
    // console.log('defaultData')
    try {
        await Products.deleteMany()
        await Products.insertMany(products);
        console.log('data imported succesfully')
    } catch (error) {
        console.log('Error', error.message)
    }
}
export default DefaultData;