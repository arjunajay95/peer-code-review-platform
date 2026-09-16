import userRepository from "../repository/user.repository.js";
import { NotFoundError } from "../errors/NotFoundError.js";
import type { PatchMeBody } from "../models/user.model.js";

interface PaginationInput { page: number; limit: number; }

class UserService {
  getMe(userId: number) { return userRepository.findById(userId); }
  updateMe(userId: number, data: PatchMeBody) { return userRepository.update(userId, data); }
  async getByUsername(username: string) {
    const user = await userRepository.findByUsername(username);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }
  async getMySubmissions(userId: number, pagination: PaginationInput) {
    return userRepository.findSubmissions(userId, pagination);
  }
  async getMyReviews(userId: number, pagination: PaginationInput) {
    return userRepository.findReviews(userId, pagination);
  }
  async getMyReviewsReceived(userId: number, pagination: PaginationInput) {
    return userRepository.findReviewsReceived(userId, pagination);
  }
}

export default new UserService();
