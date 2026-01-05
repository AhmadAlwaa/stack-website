import { CropToServer } from "../../../ServerLink/cropToServer"
import { GetJobStatus } from "./GetJobStatus";
export const ExportFunction = async (file_id:string, width:number, height:number, x:number, y:number,location:string, task_id:string, videoHeight:number) => {
  const yHeight= height+ y
  if (yHeight > videoHeight) {
    const differnce = yHeight - videoHeight
    height = height - differnce
  }
  let crop_result = await CropToServer(file_id, width, height, x, y,location, task_id);
  if (crop_result) {
    console.log(width,height,x,y)
    console.log("cropping started");
    let job_id = crop_result.job_id;
    let file_id_result = crop_result.file_id;

    let check_job = await GetJobStatus(job_id);
    if (check_job) {
      console.log("CROP COMPLETE");
      return file_id_result;   // success
    }

    console.log("crop job failed");
    return null;  // <-- prevents undefined
  }

  console.log("CropToServer returned nothing");
  return null; // <-- prevents undefined
};