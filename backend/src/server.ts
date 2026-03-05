import moodieDB_connect from "./config/db/moodieDB.js";
import { PORT } from "./config/env/env.js";
import app from "./app.js";

const PORT_NUM = parseInt(PORT, 10); // ensure PORT is a number

app.listen(PORT_NUM, "127.0.0.1", async () => { // start server 127.0.0.1 is for localhost connection to spotify api
    await moodieDB_connect(); // connect to database
});