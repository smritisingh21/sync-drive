import mongoose from "mongoose";

const connectDB = async () =>{
    try{
        console.log("ENV:", process.env.MONGODB_CONNECTION_STRING);
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
        console.log("Connected to database successfully");
    }catch(error){
        console.error("Could not connect to database" ,error);
        process.exit(1);

    }
}
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Database Disconnected!");
  process.exit(0);
});

export default connectDB;
