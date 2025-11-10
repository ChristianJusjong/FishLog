-- CreateTable
CREATE TABLE "group_messages" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "message" TEXT,
    "image_url" TEXT,
    "catch_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "group_messages_group_id_created_at_idx" ON "group_messages"("group_id", "created_at");

-- CreateIndex
CREATE INDEX "group_messages_sender_id_idx" ON "group_messages"("sender_id");

-- AddForeignKey
ALTER TABLE "group_messages" ADD CONSTRAINT "group_messages_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_messages" ADD CONSTRAINT "group_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_messages" ADD CONSTRAINT "group_messages_catch_id_fkey" FOREIGN KEY ("catch_id") REFERENCES "catches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
