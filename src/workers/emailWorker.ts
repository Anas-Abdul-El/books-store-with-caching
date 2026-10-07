import { Job, Worker } from "bullmq";
import transporter from "../libs/nodemailer";

export const EMAIL_QUEUE_NAME = "email";

export type EmailJobData = {
    to: string;
    subject: string;
    html: string;
    from?: string;
};

/**
 * The email worker processes jobs from the email queue and sends emails using
 * the configured nodemailer transporter. Failures are retried automatically
 * according to the queue's backoff strategy.
 * @param job - The BullMQ job containing the email payload.
 * @returns A promise that resolves once the email has been sent.
 */
const processEmailJob = async (job: Job<EmailJobData>) => {
    const { from, to, subject, html } = job.data;
    await transporter.sendMail({
        from: from ?? process.env.EMAIL_USER,
        to,
        subject,
        html,
    });
};

/**
 * Singleton worker instance for sending emails in the background.
 */
export const emailWorker = new Worker(EMAIL_QUEUE_NAME, processEmailJob, {
    connection: {
        url: process.env.REDIS_URL!,
    },
    concurrency: 2,
    maxStalledCount: 3,
});

/**
 * Starts the email worker and keeps it alive for processing background jobs.
 * This function does not block the Express server; it's called in index.ts.
 * @returns The worker instance.
 */
export const startEmailWorker = () => {
    emailWorker.on("failed", (job, err) => {
        console.error(`Email job ${job?.id} failed:`, err.message);
    });
    emailWorker.on("completed", (job) => {
        console.log(`Email job ${job?.id} completed`);
    });
    console.log("Email worker started");
    return emailWorker;
};
