import { feedRepository } from "../repository/feed.repository.js";
import { FeedQuery } from "../models/feed.model.js";

class FeedService {
  async getPublicFeed(query: FeedQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    let technologiesArray: string[] | undefined;
    if (query.technologies) {
      technologiesArray = query.technologies.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    }

    const [items, totalItems] = await feedRepository.getPublicFeed(skip, limit, query.search, technologiesArray);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      meta: {
        totalItems,
        currentPage: page,
        totalPages,
        itemsPerPage: limit,
      }
    };
  }

  async getPersonalizedFeed(query: FeedQuery, userId: number) {
    const { FEED_WINDOW } = await import('../config/constants.js');
    const { tagScore, recencyScore, finalScore } = await import('../utils/feedScoring.js');

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    // 1. Fetch user's tech stack
    const userTechIds = await feedRepository.getUserTechnologies(userId);
    const userTechSet = new Set(userTechIds);

    // 2. Fetch the 200-item window
    const windowItems = await feedRepository.getPersonalizedFeedWindow(FEED_WINDOW);

    // 3. Score every item in memory
    const scoredItems = windowItems.map(item => {
      const submissionTechIds = item.technologies.map(t => t.id);
      const matchedTechnologies = item.technologies
        .filter(t => userTechSet.has(t.id))
        .map(t => t.name);

      const ts = tagScore(userTechIds, submissionTechIds);
      const rs = recencyScore(item.createdAt);
      const fs = finalScore(ts, rs);

      // We clone the item to append the fields
      const scored = {
        ...item,
        matchedTechnologies,
      };

      // 4. Debug gating
      if (query.debug && process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (scored as any)._score = fs;
      }

      return {
        item: scored,
        finalScoreVal: fs,
      };
    });

    // 5. Sort by finalScore DESC, createdAt DESC, id DESC
    scoredItems.sort((a, b) => {
      if (Math.abs(a.finalScoreVal - b.finalScoreVal) > 1e-6) {
        return b.finalScoreVal - a.finalScoreVal;
      }
      const timeDiff = b.item.createdAt.getTime() - a.item.createdAt.getTime();
      if (timeDiff !== 0) return timeDiff;
      return b.item.id - a.item.id;
    });

    // 6. Paginate the scored array by offset
    const totalItems = scoredItems.length;
    const items = scoredItems.slice(skip, skip + limit).map(s => s.item);
    const totalPages = Math.ceil(totalItems / limit);

    return {
      items,
      meta: {
        totalItems,
        currentPage: page,
        totalPages,
        itemsPerPage: limit,
      }
    };
  }
}

export const feedService = new FeedService();
