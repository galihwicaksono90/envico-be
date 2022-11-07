import { PrismaClient } from "@prisma/client";
import createError from "http-errors";
import express from "express";
import {
  addBusiness,
  addBusinessFile,
  addBusinessImage,
  editBusiness,
  deleteBusiness,
} from "../Services/Business.Service";
import { verifyAccessToken } from "../Services/Token.Service";

const prisma = new PrismaClient();

const AdminRouter = express.Router();

AdminRouter.post(
  "/admin/reset-password",
  verifyAccessToken,
  async (req, res, next) => {
    try {
      //@ts-ignore
      const userId = req.payload?.admin?.id;

      if (!userId) {
        return;
      }

      const doesExist = await prisma.admin.findUnique({
        where: { id: userId },
      });
      if (!doesExist) {
        throw new createError.BadRequest("Admin not found");
      }

      const result = await prisma.admin.update({
        where: { id: userId },
        data: {
          password: req.body.password,
        },
      });

      return res.json("Success");
    } catch (error) {
      next(error);
    }
  }
);

export default AdminRouter;
