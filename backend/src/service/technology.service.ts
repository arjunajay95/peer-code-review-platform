import technologyRepository from "../repository/technology.repository.js";

class TechnologyService {
  getAll() { return technologyRepository.findAll(); }
}

export default new TechnologyService();
