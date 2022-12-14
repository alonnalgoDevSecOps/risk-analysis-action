
import AWS, { config } from 'aws-sdk'; 
import{debug, getInput, setFailed } from '@actions/core'
import { s3Client } from './s3Client'
import { CloudProvider } from './provider.model';
import { context } from '@actions/github';
import { PutObjectCommand, PutObjectCommandInput, PutObjectOutput } from '@aws-sdk/client-s3';
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { HttpClient } from '@actions/http-client';

export class AwsProvider implements CloudProvider {
    s3Dest: string
    actionUuid: string

    constructor(actionUuid: string, s3Dest: string){
        this.s3Dest = s3Dest
        this.actionUuid = actionUuid
    }

    async login() {
        config.getCredentials(function(err) {
            if (err) console.log(err.stack);
                // credentials not loaded
            else {
                  console.log("aws region:", config.region);
                }
        });
    }

    async uploadToS3(tenantId: string, body: any, jwt: string): Promise<any> {


        const http = new HttpClient()
        const getPresignedUrl = `${process?.env?.SI_API_URL}?jwt=${jwt}&tenantId=${tenantId}&actionId=${this.actionUuid}&owner=${context.repo.owner}`
        const presignedUrlResponse = await (await http.get(getPresignedUrl)).readBody()
        const presignedUrl = JSON.parse(presignedUrlResponse).presignedUrl
        const response = await (await http.put(presignedUrl, body, {'Content-Type':'application/json'})).readBody()
        if (response == ''){
          return true
        } else {
          setFailed(response)
        }

    }
    
}




