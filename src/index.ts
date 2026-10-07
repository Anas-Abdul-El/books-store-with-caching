import dotenv from "dotenv";
import e from "express";
import helmet from "helmet";
import { errorHandler, notFound } from "./middlewares";
import { startEmailWorker } from "./workers/emailWorker";
import router from "./routes";

dotenv.config();

const PORT = process.env.PORT || 3220;

const app = e();

app.use(helmet());

// parse requests of content-type - application/json
app.use(e.json());
app.use(e.urlencoded({ extended: true }));

app.use("/api/", router);

// nothing matched: a 404 for an unknown URL, then the single place where every
// thrown or rejected error becomes a JSON answer
app.use(notFound);
app.use(errorHandler);

startEmailWorker();

app.listen(+PORT, "0.0.0.0", () => {
    console.log("the server is listening on port " + PORT);
});
