import dotenv from "dotenv";
import e from "express";
import helmet from "helmet";
import router from "./routes";

dotenv.config();

const PORT = process.env.PORT || 3220;

const app = e();

app.use(helmet());

// parse requests of content-type - application/json
app.use(e.json());
app.use(e.urlencoded({ extended: true }));

// app routes
app.use("/api/", router);

app.listen(+PORT, "0.0.0.0", () => {
    console.log("the server is listening on port " + PORT);
});
