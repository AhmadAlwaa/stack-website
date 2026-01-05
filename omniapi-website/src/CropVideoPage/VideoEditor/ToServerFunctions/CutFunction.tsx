import { GetJobStatus } from "./GetJobStatus";
import { CutToServer } from "../../../ServerLink/CutToServer";
export const CutFunction =  async(file_id:string, start_times:number[], end_times:number[], location:string, task_id:string)=>{
    let cut_result = await CutToServer(file_id, start_times, end_times,location, task_id)
    if (cut_result){
        let job_id = cut_result.job_id
        let file_id = cut_result.file_id
        let check_job = await GetJobStatus(job_id)
        if (check_job){
            return file_id
        }
    }
}