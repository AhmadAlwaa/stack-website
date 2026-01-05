import { GetJobStatus } from "./GetJobStatus";

export const UploadFunction =  async(job_id:string)=>{
            let check_job = await GetJobStatus(job_id)
            if (check_job){
                return true
            }return false
    }