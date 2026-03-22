// scripts/cloud_audit.js
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config({ path: '../backend/.env' });

async function audit() {
  console.log('--- Cloud Connectivity Audit ---');

  // 1. MongoDB Atlas
  try {
    console.log('1. MongoDB Atlas: Checking...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB: Connected Successfully!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ MongoDB: Connection Failed!', err.message);
  }

  // 2. SMTP (Email)
  try {
    console.log('\n2. SMTP (Email): Checking...');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.verify();
    console.log('✅ SMTP: Credentials Verified Successfully!');
  } catch (err) {
    console.error('❌ SMTP: Verification Failed!', err.message);
  }

  // 3. n8n Node
  try {
    console.log('\n3. n8n Webhooks: Checking...');
    const urls = [
      process.env.N8N_CHAT_WEBHOOK,
      process.env.N8N_UPLOAD_WEBHOOK,
      process.env.N8N_DELETE_WEBHOOK
    ];
    for (const url of urls) {
      try {
        // We just check if the URL is reachable (not necessarily 200, as webhooks might expect POST)
        await axios.get(url, { timeout: 3000 }).catch(e => {
            if (e.response) {
                console.log(`📡 URL Reachable: ${url} (Status: ${e.response.status})`);
            } else {
                throw e;
            }
        });
      } catch (e) {
         console.warn(`⚠️  Webhook at ${url} is not responding to GET, but might still work for POST.`);
      }
    }
  } catch (err) {
    console.error('❌ n8n: Reachability Check Failed!', err.message);
  }

  console.log('\n--- Audit Complete ---');
  process.exit();
}

audit();
