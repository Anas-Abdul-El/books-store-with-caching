import { Queue, Worker } from "bullmq";
import type { ConnectionOptions } from "bullmq";
import transporter from "../libs/nodemailer";

export const EMAIL_QUEUE_NAME = "email";

export type EmailJobData = {
    to: string;
    subject: string;
    html: string;
    from?: string | undefined;
};

const connection: ConnectionOptions = {
    url: process.env.REDIS_URL || "redis://localhost:6379",
};

/**
 * Email queue instance for sending emails in background.
 * Jobs are retried with exponential backoff and old completed/failed jobs are cleaned up.
 */
export const emailQueue = new Queue<EmailJobData>(EMAIL_QUEUE_NAME, {
    connection,
    defaultJobOptions: {
        attempts: 5,
        backoff: {
            delay: 1000,
            type: "exponential",
        },
        removeOnComplete: { age: 3600, count: 100 },
        removeOnFail: { age: 86400, count: 100 },
    },
});

/**
 * Process email job and send it via nodemailer transporter.
 */
const processEmailJob = async (job: { data: EmailJobData }) => {
    const { from, to, subject, html } = job.data;
    await transporter.sendMail({
        from: from ?? process.env.EMAIL_USER,
        to,
        subject,
        html,
    });
};

/**
 * Creates and configures the email worker instance.
 * @returns {Worker<EmailJobData>} Configured BullMQ worker
 */
export const createEmailWorker = (): Worker<EmailJobData> => {
    const worker = new Worker<EmailJobData>(EMAIL_QUEUE_NAME, processEmailJob, {
        connection,
        concurrency: 2,
        maxStalledCount: 3,
    });
    worker.on("failed", (job, err) => {
        console.error(`Email job ${job?.id} failed:`, err.message);
    });
    worker.on("completed", (job) => {
        console.log(`Email job ${job?.id} completed`);
    });
    return worker;
};

/**
 * Starts the email worker and returns the worker instance.
 * @returns {Worker<EmailJobData>} Started worker instance
 */
export const startEmailWorker = (): Worker<EmailJobData> => createEmailWorker();
