import mongoose from "mongoose";
async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log(`Connected to database!`)
    }catch(err){
        console.error(err)
    }
}
export default connectDB;