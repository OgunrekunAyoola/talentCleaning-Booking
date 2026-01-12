-- DropForeignKey
ALTER TABLE "public"."BookingEvent" DROP CONSTRAINT "BookingEvent_bookingId_fkey";

-- AddForeignKey
ALTER TABLE "BookingEvent" ADD CONSTRAINT "BookingEvent_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
