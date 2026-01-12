import {OverlayTextToServer } from "../../../ServerLink/OverlayTextToServer"
import { GetJobStatus } from "./GetJobStatus";
export const TextOverlayFunction =  async(file_id:string, text:string, x_pos:number, y_pos:number, font_size:number,font:string,color:string,location:string, task_id:string) =>{
  let overlay_result = await OverlayTextToServer(file_id,text, x_pos, y_pos, font_size,font,color,location,task_id)
      if (overlay_result){
          let job_id = overlay_result.job_id
          let file_id = overlay_result.file_id
          let check_job = await GetJobStatus(job_id)
          if (check_job){
              return file_id 
        }
    }
}
