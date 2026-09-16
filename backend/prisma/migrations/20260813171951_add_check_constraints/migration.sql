ALTER TABLE "CriterionRating"
  ADD CONSTRAINT "chk_rating_range" CHECK ("rating" BETWEEN 1 AND 5);

ALTER TABLE "User"
  ADD CONSTRAINT "chk_karma_nonnegative" CHECK ("karma" >= 0);

ALTER TABLE "Technology"
  ADD CONSTRAINT "chk_technology_lowercase" CHECK ("name" = lower(btrim("name")));
