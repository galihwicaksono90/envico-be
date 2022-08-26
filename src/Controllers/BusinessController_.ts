import express from "express";
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";
import formidable from "formidable";
import { verifyAccessToken } from "../Services/Token.Service";

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
    console.log({ e });
  }
});

BusinessRouter.delete("/business/:id", verifyAccessToken, async (req, res) => {
  try {
    const business = await prisma.business.findUnique({
      where: {
        id: req.params.id,
      },
    });

    if (!!business?.imagePath) {
      fs.unlinkSync(
        path.join(__dirname, "public", path.basename(business?.imagePath))
      );
    }

    if (!!business?.filePath) {
      fs.unlinkSync(
        path.join(__dirname, "public", path.basename(business?.filePath))
      );
    }

    const deletedBusiness = await prisma.business.delete({
      where: {
        id: req.params.id,
      },
    });
    return res.status(200).json(deletedBusiness);
  } catch (e) {
    console.log({ e });
  }
});

BusinessRouter.post("/business", async (req, res, next) => {
  const form = formidable({
    multiples: true,
    uploadDir: path.join(__dirname, "public"),
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }

    if (err) {
      return res.status(500).json({ message: "Error parsing request" });
    }

    const b = await prisma.business.findFirst({
      where: {
        title: fields.title as string,
      },
    });

    if (!!b) {
      if (!Array.isArray(files.file) && !!files?.file) {
        fs.unlinkSync(
          path.join(__dirname, "public", path.basename(files.file.newFilename))
        );
      }
      if (!Array.isArray(files.image) && !!files?.image) {
        fs.unlinkSync(
          path.join(__dirname, "public", path.basename(files.image.newFilename))
        );
      }
      return res.status(400).json({ message: "Title already taken" });
    }

    if (!files.image) {
      return res.status(500).json({ message: "No image" });
    }

    const values = {
      title: fields.title as string,
      content: fields.content as string,
      description: fields.description as string,
      asSlide: fields.asSlide === "true" ? true : false,
      filePath:
        !Array.isArray(files.file) && !!files?.file
          ? `${req.protocol}://${req.get("host")}/${
              files.file.newFilename as string
            }`
          : "",
      imagePath:
        !Array.isArray(files.image) && !!files?.image
          ? `${req.protocol}://${req.get("host")}/${
              files.image.newFilename as string
            }`
          : "",
    };

    try {
      const result = await prisma.business.create({
        data: values,
      });

      return res.status(200).json({ result });
    } catch (e) {
      if (!Array.isArray(files.file) && !!files?.file) {
        fs.unlinkSync(
          path.join(__dirname, "public", path.basename(files.file.newFilename))
        );
      }
      if (!Array.isArray(files.image) && !!files?.image) {
        fs.unlinkSync(
          path.join(__dirname, "public", path.basename(files.image.newFilename))
        );
      }
      return res.status(400).json({ message: e });
    }
  });
});

BusinessRouter.patch("/:id", async (req, res, next) => {
  const business = await prisma.business.findUnique({
    where: {
      id: req.params.id,
    },
  });
  if (!business) {
    return res.status(404).json({ message: "No data found" });
  }

  const form = formidable({
    multiples: true,
    uploadDir: path.join(__dirname, "public"),
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }

    if (err) {
      return res.status(500).json({ message: "Error parsing request" });
    }

    const values = {
      ...business,
      ...fields,
      asSlide: fields.asSlide === "true" ? true : false,
    };

    if (!!files.image) {
      try {
        fs.unlinkSync(
          path.join(__dirname, "public", path.basename(business.imagePath))
        );
      } catch (e) {}
      values.imagePath =
        !Array.isArray(files.image) && !!files?.image
          ? `${req.protocol}://${req.get("host")}/${
              files.image.newFilename as string
            }`
          : "";
    }
    if (!!files.file) {
      if (!!business.filePath) {
        try {
          fs.unlinkSync(
            path.join(__dirname, "public", path.basename(business.filePath))
          );
        } catch (e) {}
      }
      values.filePath =
        !Array.isArray(files.file) && !!files?.file
          ? `${req.protocol}://${req.get("host")}/${
              files.file.newFilename as string
            }`
          : "";
    }
    try {
      const ress = await prisma.business.update({
        where: {
          id: req.params.id,
        },
        data: {
          ...values,
        },
      });
      return res.status(200).json(ress);
    } catch (e) {
      console.log(e);
      return res.status(400).json({ message: e });
    }
  });
});

export default BusinessRouter;
