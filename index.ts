import { BskyAgent } from '@atproto/api';
import * as dotenv from 'dotenv';
import { CronJob } from 'cron';
import * as process from 'process';
import * as fs from 'node:fs';
import * as path from 'node:path';

dotenv.config();

// Create a Bluesky Agent 
const agent = new BskyAgent({
    service: 'https://bsky.social',
  })


async function main() {
    // get a random file from the list
    const fileUrls = fs
    .readFileSync(process.env.IMAGE_LIST_NAME!)
        .toString('utf8')
        .split('\n');
    const randomFileUrl = fileUrls[fileUrls.length * Math.random() | 0];
    const basename = path.basename(randomFileUrl);
    console.log(`Fetching file... ${randomFileUrl}`);
    const imageBlob = await (await fetch(randomFileUrl)).blob();
    console.log(`Got ${basename} (size=${imageBlob.size},type=${imageBlob.type})`);
    
    console.log(`Logging in as ${process.env.BLUESKY_USERNAME!}...`);
    await agent.login({ identifier: process.env.BLUESKY_USERNAME!, password: process.env.BLUESKY_PASSWORD!})
    
    console.log(`Uploading image as blob...`);
    const uploadBlobRespose = await agent.uploadBlob(await imageBlob.bytes(), {
        "encoding": "",
        "headers": {
            "Content-Type": imageBlob.type
        }
    });
    const blobRef = uploadBlobRespose.data.blob;
    console.log(`Successfully uploaded blob (ref=${blobRef.toJSON()})`);
    
    const postResponse = await agent.post({
        text: basename,
        embed: {
            $type: "app.bsky.embed.images",
            images: [{
                alt: basename,
                image: blobRef
            }]
        }
    });
    
    console.log(`Just posted! ${postResponse.cid}`);
}

async function tryMain() {
    try {
        main() 
    } catch (e) {
        console.error(e);
    };
}

tryMain();

// Run this on a cron job
const scheduleExpressionMinute = '* * * * *'; // Run once every minute for testing
const scheduleExpression = '0 */3 * * *'; // Run once every three hours in prod

const job = new CronJob(scheduleExpressionMinute, tryMain); // change to scheduleExpressionMinute for testing

job.start();