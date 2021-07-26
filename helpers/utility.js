const config = require('../config/app')

var fs = require('fs');
const AWS = require('aws-sdk');
const jwt = require("jsonwebtoken");
const s3 = new AWS.S3({
    accessKeyId: config.S3_BUCKET_ACCESS_KEY,
    secretAccessKey: config.S3_BUCKET_SECRET_ACCESS_KEY,
    region:config.S3_BUCKET_REGION
});  

exports.uploadFile = (path,fileName,content_type,bucket) => {   
	
    return new Promise( function ( resolve , reject ) {
		// Read content from the file
        //const fileContent = fs.readFileSync(path+fileName);     
        const readStream = fs.createReadStream(path+fileName);
        // Setting up S3 upload parameters       
        // Uploading files to the bucket
        var response = {};
        const params = {
            Bucket: bucket,
            Key: fileName,
            ACL: 'public-read',
            Body: readStream,
            ContentType: content_type                   
        };

        s3.upload(params, async function(err, data) {            
            readStream.destroy();            
            if (err) {
                console.log("Error is here",err);
                response = {
                    message:'error',
                    data: err
                }
            }       

            if(data)
            {
                console.log("Data is here",data);
                fs.unlink(path+fileName, function (err) {
                    if (err) {
                        response = {
                            message:'error',
                            data: err
                        }
                        reject(response);
                    }else{

                        console.log(`File uploaded successfully. ${data.Location}`); 

                        response = {
                            message:'success',
                            data: data.Location
                        }

                        resolve(response);
                    }
                });        
                
            }
            
        });
    });    
};


exports.deleteS3File = (fileName, bucket_name) =>{

    return new Promise(function (resolve, reject){
        var response = {};
        const params = {
            Bucket: bucket_name,
            Key: fileName                             
        };

        s3.deleteObject(params, function(err, data) {
            if (err) {
                response = {
                    message:'error',
                    err: err
                }
                reject(response);
            }
            if(data){
            response={
                message:"Deleted Successfully.",
                data: data
            }  
            resolve(response);
        }else{
            response = {
                    message:'File Not Found.'
                }
                reject(response);
        }
        });
    });
};
