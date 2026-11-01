-- F-020: Constrain testimonial rating to integer range 1-5
-- Prevents stored content from controlling allocation size in the renderer.
ALTER TABLE testimonials DROP CONSTRAINT IF EXISTS testimonials_rating_range;
ALTER TABLE testimonials ADD CONSTRAINT testimonials_rating_range
  CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));

