import createError from "http-errors";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "./Token.Service";

const prisma = new PrismaClient();

export const login = async (user: { name: string; password: string }) => {
  const { name, password } = user;

  const admin = await prisma.admin.findFirst({
    where: { name },
  });

  if (!admin) throw new createError.Unauthorized("Admin not found");
  //const isMatch = await bcrypt.compare(password, admin.password || "");
  const isMatch = password === admin.password;
  if (!isMatch)
    throw new createError.Unauthorized("Username/password not valid");
  const accessToken = await signAccessToken(admin.id);

  const refreshToken = await signRefreshToken(admin.id);
  return { accessToken, refreshToken, admin };
};

export const refreshToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new createError.BadRequest();
  }
  const userId = await verifyRefreshToken(refreshToken);
  const newAccessToken = await signAccessToken(userId);
  const newRefreshToken = await signRefreshToken(userId);
  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logout = async (refreshToken: string) => {
  if (!refreshToken) throw new createError.BadRequest();
  const adminId = await verifyRefreshToken(refreshToken);

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
  });

  if (!admin) throw new createError.InternalServerError();
  return true;
};
