require('dotenv').config()
// console.log(process.env.PORT)
module.exports= {
    PORT:process.env.PORT,
    MONGODB_URL:process.env.MONGODB_URL,
    LOG_SECRET_KEY :process.env.LOG_SECRET_KEY,
    S3_BUCKET_ACCESS_KEY : process.env.S3_BUCKET_ACCESS_KEY,
    S3_BUCKET_SECRET_ACCESS_KEY : process.env.S3_BUCKET_SECRET_ACCESS_KEY,
    S3_BUCKET_REGION  : process.env.S3_BUCKET_REGION,
    S3_BUCKET_NAME : process.env.S3_BUCKET_NAME,
    SENDGRID_API_KEY : process.env.SENDGRID_API_KEY,
    SENDER_EMAIL: process.env.SENDER_EMAIL,
    TICKET_MASTER_API_KEY: process.env.TICKET_MASTER_API_KEY
}
