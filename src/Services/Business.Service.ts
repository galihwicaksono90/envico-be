import { Request } from "express";
import formidable from "formidable";
import { PrismaClient } from "@prisma/client";
import { AddBusinessDTO, addBusinessSchema } from "../dto/BusinessDTO";
import createError from "http-errors";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

export const addBusiness = async (req: Request): Promise<any> => {
  const form = formidable({
    uploadDir: path.join(__dirname, "../..", "public"),
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.log({ err });
    }

    const { title } = fields;

    const doesExist = await prisma.business.findUnique({
      where: { title: title as string },
    });

    if (doesExist) {
      throw new createError.Conflict(`The title "${title}" is already taken`);
    }

    const business = await prisma.business.create({
      data: {
        title: fields.title as string,
        description: fields.description as string,
        content: fields.content as string,
        asSlide: fields.asSlide === "true" ? true : false,
      },
    });

    return business;
  });
};

export const editBusiness = async (req: Request, id: string): Promise<any> => {
  const form = formidable({
    uploadDir: path.join(__dirname, "../..", "public"),
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    // if (err) {
    //   console.log({ err });
    // }

    const { title } = fields;

    const doesExist = await prisma.business.findUnique({
      where: { id },
    });

    if (!doesExist) {
      throw new createError.Conflict(`Business does not exist`);
    }

    const business = await prisma.business.update({
      where: { id },
      data: {
        title: fields.title as string,
        description: fields.description as string,
        content: fields.content as string,
        asSlide: fields.asSlide === "true" ? true : false,
      },
    });

    return business;
  });
};

// export const editBusiness = async (
//   addBusinessDto: AddBusinessDTO,
//   id: string
// ): Promise<any> => {
//   const result: AddBusinessDTO = await addBusinessSchema.validateAsync(
//     addBusinessDto
//   );
//   const doesExist = await prisma.business.findUnique({ where: { id } });
//   if (!doesExist) {
//     throw new createError.Conflict(`Not found`);
//   }
//   const business = await prisma.business.update({
//     where: { id },
//     data: result,
//   });
//   return business;
// };

export const addBusinessImage = async (req: Request) => {
  const form = formidable({
    uploadDir: path.join(__dirname, "../..", "public"),
    keepExtensions: true,
    multiples: false,
  });
  const business = await prisma.business.findUnique({
    where: { id: req.params.id },
  });

  if (!business) {
    throw new createError.BadRequest("Business id is not valid");
  }

  if (!!business.imagePath) {
    try {
      fs.unlinkSync(
        path.join(
          __dirname,
          "../..",
          "public",
          path.basename(business.imagePath!)
        )
      );
    } catch (e) {}
  }

  form.parse(req, async (err, fields, files) => {
    if (err) {
      throw new createError.BadRequest(err);
    }
    // if (!files?.image) {
    //   throw new createError.BadRequest("Image not found");
    // }

    let newFilename: string = "";
    if ("newFilename" in files?.image) {
      newFilename = files.image.newFilename;
    }

    const result = await prisma.business.update({
      where: { id: req.params.id },
      data: {
        imagePath: `${req.protocol}://${req.get("host")}/${newFilename}`,
      },
    });
    return result;
  });
};

export const addBusinessFile = async (req: Request) => {
  const form = formidable({
    uploadDir: path.join(__dirname, "../..", "public"),
    keepExtensions: true,
    multiples: false,
  });
  const business = await prisma.business.findUnique({
    where: { id: req.params.id },
  });

  if (!business) {
    throw new createError.BadRequest("Business id is not valid");
  }

  if (!!business.filePath) {
    try {
      fs.unlinkSync(
        path.join(
          __dirname,
          "../..",
          "public",
          path.basename(business.filePath!)
        )
      );
    } catch (e) {}
  }

  form.parse(req, async (err, fields, files) => {
    if (err) {
      throw new createError.BadRequest(err);
    }

    let newFilename: string = "";
    if ("newFilename" in files.file) {
      newFilename = files.file.newFilename;
    }

    const result = await prisma.business.update({
      where: { id: req.params.id },
      data: {
        filePath: `${req.protocol}://${req.get("host")}/${newFilename}`,
      },
    });
    return result;
  });
};

export const deleteBusiness = async (id: string) => {
  const business = await prisma.business.findUnique({ where: { id } });
  if (!business) throw new createError.BadRequest("Business not found");
  if (!!business.filePath) {
    try {
      fs.unlinkSync(
        path.join(
          __dirname,
          "../..",
          "public",
          path.basename(business.filePath!)
        )
      );
    } catch (e) {}
  }
  if (!!business.imagePath) {
    try {
      fs.unlinkSync(
        path.join(
          __dirname,
          "../..",
          "public",
          path.basename(business.imagePath!)
        )
      );
    } catch (e) {}
  }
  const deleted = await prisma.business.delete({
    where: { id },
  });
  if (!deleted) throw createError("Failed to delete");
  return deleted;
};
