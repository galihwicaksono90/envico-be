import express from "express";
import { PrismaClient } from "@prisma/client";
import { login, logout, refreshToken } from "../Services/Auth.Service";
import { verifyAccessToken } from "../Services/Token.Service";

const prisma = new PrismaClient();

const AuthRouter = express.Router();

AuthRouter.get("/me", verifyAccessToken, async (req, res, next) => {
  //@ts-ignore
  try {
    //@ts-ignore
    const userId = req.payload?.admin?.id;
    const user = await prisma.admin.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    res.send(user);
  } catch (error) {
    next(error);
  }
});

AuthRouter.post("/login", async (req, res, next) => {
  try {
    const { accessToken, refreshToken, admin } = await login(req.body);

    res.cookie("refresh_token", refreshToken, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
    });

    res.send({ accessToken, admin });
  } catch (error) {
    next(error);
  }
});

AuthRouter.delete("/logout", async (req, res, next) => {
  try {
    res.cookie("refresh_token", "", {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
    });
    const result = await logout(req.cookies.refresh_token);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

AuthRouter.post("/refresh-token", async (req, res, next) => {
  try {
    const result = await refreshToken(req.cookies.refresh_token);
    res.cookie("refresh_token", result.refreshToken, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
    });
    res.send({ accessToken: result.accessToken });
  } catch (error) {
    next(error);
  }
});

export default AuthRouter;
