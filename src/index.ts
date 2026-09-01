import dotenv from "dotenv";
import e from "express";

dotenv.config();

const PORT = process.env.PORT || 3220;

const app = e();

app.listen(+PORT, "0.0.0.0", () => {
    console.log("the server is listening on port " + PORT);
});
