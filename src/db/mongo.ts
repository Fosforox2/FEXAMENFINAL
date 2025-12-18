import { Db, MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let client: MongoClient;
let dB: Db;
const dbName = "clase_DDBB";

export const connectToMongoDB = async () => {
    try{
        const mongoUrl = `mongodb+srv://${process.env.USER_MONGO}:${process.env.USER_PASSWORD}@${process.env.MONGO_CLUSTER}.v1bwama.mongodb.net/?appName=${process.env.MONGO_APP_NAME}`;
        if(mongoUrl){
            client = new MongoClient(mongoUrl);
            await client.connect();
            dB = client.db(dbName);
            console.log("Estás conectado al mondongo cosa guapa!");
        } else {
            throw new Error("MONGO_URL is not defined in environment variables");
        }
    }
    catch(err){
        console.log("Error del mondongo baby: ", err)
    }
};

export const getDB = ():Db => dB;