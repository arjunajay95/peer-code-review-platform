import prisma from "../config/prisma.js";

class TechnologyRepository {
  findAll() {
    return prisma.technology.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
  }
}

export default new TechnologyRepository();
