import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { config } from "dotenv";
import AuthRouter from "./routes/auth.routes";
import ApiRouter from "./routes/api.routes";

config();

const app = express();
const port = process.env.PORT || 7000;

app.use(bodyParser.json());
app.use(cors());
app.use("/auth", AuthRouter);
app.use("/api", ApiRouter);


app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;