-- Add human-readable sequential customer number
ALTER TABLE "Customer"
ADD COLUMN "customerNumber" SERIAL NOT NULL;

-- Ensure every customer number is unique
CREATE UNIQUE INDEX "Customer_customerNumber_key"
ON "Customer"("customerNumber");