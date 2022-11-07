import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import createError from "http-errors";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const signAccessToken = (id: string) => {
  return new Promise((resolve, reject) => {
    const payload = {
      admin: { id },
    };
    const secret = process.env.ACCESS_TOKEN_SECRET || "RandomToken";
    const options = {
      expiresIn: "1d",
      audience: `${id}`,
    };

    jwt.sign(payload, secret, options, async (err, token) => {
      if (err) {
        reject(new createError.InternalServerError());
        return;
      }
      resolve(token);
    });
  });
};

export const verifyAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers["authorization"])
    return next(new createError.Unauthorized());
  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader.split(" ");
  const token = bearerToken[1];
  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET || "RandomToken",
    async (err, payload) => {
      if (err) {
        const message =
          err.name === "JsonWebTokenError"
            ? "Unautorized"
            : (err.message as string);
        return next(new createError.Unauthorized(message));
      }

      //@ts-ignore
      // const user =await prisma.admin.findUnique({where: {id: payload?.admin?.userId}})
      req.payload = payload;
      next();
    }
  );
};

export const signRefreshToken = (id: string) => {
  return new Promise((resolve, reject) => {
    const payload = {
      admin: { id },
    };

    const secret = process.env.REFRESH_TOKEN_SECRET || "RandomRefreshToken";

    const options = {
      expiresIn: "1y",
      audience: `${id}`,
    };
    jwt.sign(payload, secret, options, async (err, token) => {
      if (err) {
        console.log({ err });
        reject(new createError.InternalServerError());
      }
      //await prisma.user.update({where: {id}, data})
      resolve(token);
    });
  });
};

export const verifyRefreshToken = (refreshToken: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || "RandomRefreshToken",
      async (err, payload: any) => {
        if (err) return reject(new createError.Unauthorized());
        const adminId: string | undefined = payload.aud;

        if (!adminId) {
          throw new createError.Unauthorized();
        }

        const admin = await prisma.admin.findUnique({ where: { id: adminId } });
        if (!admin) {
          reject(new createError.Unauthorized());
        }
        resolve(adminId);
      }
    );
  });
};
