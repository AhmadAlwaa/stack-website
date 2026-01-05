import { checkJobStatus } from "../../../ServerLink/checkJobStatus";
export const GetJobStatus = async (job_id: string) => {
    while(true){
      console.log("CHECK JOB")
      const result = await checkJobStatus(job_id)
      if (result.status==='finished'){
        return true
      }
      else if (result.status ==='failed'){
        return false
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }