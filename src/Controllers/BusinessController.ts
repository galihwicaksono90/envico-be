import { PrismaClient } from "@prisma/client";
import express from "express";
import {
  addBusiness,
  addBusinessFile,
  addBusinessImage,
  editBusiness,
  deleteBusiness,
} from "../Services/Business.Service";

const prisma = new PrismaClient();

const BusinessRouter = express.Router();

BusinessRouter.get("/business", async (req, res) => {
  try {
    const businesses = await prisma.business.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        imagePath: true,
        asSlide: true,
        createdAt: true,
        updatedAt: true,
      },
      take: 6,
    });
    return res.status(200).json(businesses);
  } catch (e) {
    console.log(e);
  }
});

BusinessRouter.get("/business/dashboard", async (req, res) => {
  try {
    const businesses = await prisma.business.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        imagePath: true,
        asSlide: true,
        createdAt: true,
        updatedAt: true,
        filePath: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return res.status(200).json(businesses);
  } catch (e) {
    console.log(e);
  }
});

BusinessRouter.get("/business/title/:title", async (req, res) => {
  try {
    const businesses = await prisma.business.findUnique({
      where: {
        title: req.params.title,
      },
    });
    return res.status(200).json(businesses);
  } catch (e) {}
});

BusinessRouter.get("/business/:id", async (req, res) => {
  try {
    const businesses = await prisma.business.findUnique({
      where: {
        id: req.params.id,
      },
    });
    return res.status(200).json(businesses);
  } catch (e) {
    console.log(e);
  }
});

BusinessRouter.post("/business", async (req, res, next) => {
  try {
    const result = await addBusiness(req);

    res.send({ business: result });
  } catch (error) {
    next(error);
  }
});

BusinessRouter.patch("/business/:id", async (req, res, next) => {
  try {
    const result = await editBusiness(req, req.params.id);

    res.send({ business: result });
  } catch (error) {
    next(error);
  }
});

BusinessRouter.patch("/business/image/:id", async (req, res, next) => {
  try {
    const result = await addBusinessImage(req);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

BusinessRouter.patch("/business/file/:id", async (req, res, next) => {
  try {
    const result = await addBusinessFile(req);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

BusinessRouter.delete("/business/:id", async (req, res, next) => {
  try {
    const result = await deleteBusiness(req.params.id);
    res.send(result);
  } catch (error) {
    next(error);
  }
});

export default BusinessRouter;
