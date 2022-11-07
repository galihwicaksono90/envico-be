import { PrismaClient } from "@prisma/client";

const run = async () => {
  const prisma = new PrismaClient();
  try {
    if ((await prisma.admin.count()) === 0) {
      await prisma.admin.create({
        data: {
          name: "admin",
          password: "admin",
        },
      });
    }
  } catch (e) {
    console.log("Admin already created");
  } finally {
  }
};

run();
