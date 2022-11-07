import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import BusinessRouter from "./src/Controllers/BusinessController";
import AuthRouter from "./src/Controllers/AuthController";
import AdminRouter from "./src/Controllers/AdminController";
import MailRouter from "./src/Controllers/MailController";
import cookieParser from "cookie-parser";

export type ErrorType = Error & { status: number };

const app = express();

const port = process.env.port || 4000;

app.use(cookieParser());

app.use(cors());

app.use(express.json());

app.use(express.static("public"));

app.use(BusinessRouter);

app.use(AuthRouter);

app.use(AdminRouter);

app.use(MailRouter);

// app.use(async (_req, res, next) => {
//   next(new createError.NotFound("This route does not exist"));
// });

app.use(
  async (err: ErrorType, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.status || 500);
    res.send({
      error: {
        status: err.status || 500,
        message: err.message,
      },
    });
  }
);

app.listen(port, () => {
  console.log("started");
});
