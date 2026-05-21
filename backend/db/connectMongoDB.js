import mongoose from "mongoose";

import * as dns from "dns";
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectMongoDB= async() =>{
    try{
       const conn= await mongoose.connect(process.env.MONGO_URI)
       console.log(`MongoDB connected: ${conn.connection.host}`);
    } 
    catch(error){
        console.error(`Error connection to mongoDB: ${error.message}`);
        process.exit(1)
    }
}

export default connectMongoDB;
