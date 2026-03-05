import mongoose from "mongoose";
import { DB_URI } from "../env/env.js"; 

const moodieDB_connect = async () => { // connect to Moodie database
    try {
        await mongoose.connect(DB_URI); // connect to the database using the URI from environment variables

    } catch(error) {
        console.error("Cannot connect to the Moodie database", error);
    }
}

export default moodieDB_connect;