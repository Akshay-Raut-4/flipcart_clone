
import mongoose from 'mongoose'
// import default from 'sift/lib';

const Connection = async (useName,passWord) => {
    const URL=`mongodb+srv://${useName}:${passWord}@cluster0.n6bof.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
    
    
    try{
    await mongoose.connect(URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify:false
      })
      console.log('DB connected succesfully')
    }
    catch(error){
     console.log('Error',error.message)
    }
}

export default Connection;