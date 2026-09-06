BEGIN;

DELETE FROM "OrderItem";
DELETE FROM "Order";
DELETE FROM "Product";

INSERT INTO "Category" ("name", "slug", "description", "imageUrl", "active", "createdAt", "updatedAt")
VALUES
  ('Haircare', 'haircare', 'Natural treatments, cleansers, and moisturisers for healthy hair and scalp.', '/uploads/miimo-hair-butter.webp', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Body Care', 'body-care', 'Natural care for nourished skin and restorative beauty rituals.', '/uploads/miimo-henna-hair-mask.webp', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "imageUrl" = EXCLUDED."imageUrl",
  "active" = true,
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "Product" ("name", "slug", "sku", "description", "priceCents", "stock", "imageUrl", "status", "categoryId", "createdAt", "updatedAt")
VALUES
  ('Low Porosity Hair Oil', 'low-porosity-hair-oil', 'MIIMO-HAIR-001', 'A lightweight, fast-absorbing natural hair oil made for low porosity hair. Helps seal moisture, reduce breakage, and add shine.', 65000, 100, '/uploads/miimo-low-porosity-hair-oil.webp', 'ACTIVE', (SELECT "id" FROM "Category" WHERE "slug" = 'haircare'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Henna Hair Mask', 'henna-hair-mask', 'MIIMO-BODY-001', 'A rich natural henna mask formulated to nourish, strengthen, and restore a healthy-looking finish.', 70000, 100, '/uploads/miimo-henna-hair-mask.webp', 'ACTIVE', (SELECT "id" FROM "Category" WHERE "slug" = 'body-care'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Hair Butter', 'hair-butter', 'MIIMO-HAIR-002', 'Deep moisturising natural hair butter with plant oils for kinky, coily, and curly hair.', 90000, 100, '/uploads/miimo-hair-butter.webp', 'ACTIVE', (SELECT "id" FROM "Category" WHERE "slug" = 'haircare'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Low Porosity Hair Mask', 'low-porosity-hair-mask', 'MIIMO-HAIR-003', 'An intensive conditioning mask that restores moisture, strengthens strands, and helps reduce breakage.', 90000, 100, '/uploads/miimo-low-porosity-hair-mask.webp', 'ACTIVE', (SELECT "id" FROM "Category" WHERE "slug" = 'haircare'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Sulfate Free Shampoo', 'sulfate-free-shampoo', 'MIIMO-HAIR-004', 'A gentle sulfate-free shampoo that cleanses natural hair without stripping moisture.', 60000, 100, '/uploads/miimo-sulfate-free-shampoo.webp', 'ACTIVE', (SELECT "id" FROM "Category" WHERE "slug" = 'haircare'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

COMMIT;
