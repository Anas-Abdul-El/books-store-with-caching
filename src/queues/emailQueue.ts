import { Queue, type QueueOptions } from "bullmq";
import { connectRedis } from "../libs/redis";

export const EMAIL_QUEUE_NAME = "email";

const queueOptions: QueueOptions = {
    connection: {
        // The shared Redis client is reconnected if needed, but BullMQ needs
        // its own connection config. Here we read the URL directly so the queue
        // has a connection independent of the express client's lifecycle.
        url: process.env.REDIS_URL!,
    },
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            delay: 1000,
            type: "exponential",
        },
        removeOnComplete: {
            age: 60 * 60, // 1 hour
            count: 100,
        },
        removeOnFail: {
            age: 60 * 60 * 24, // 24 hours
        },
    },
};

/**
 * A singleton instance of the BullMQ queue used for background email jobs.
 * Every email that would block the request is pushed into this queue.
 */
export const emailQueue = new Queue(EMAIL_QUEUE_NAME, queueOptions);
