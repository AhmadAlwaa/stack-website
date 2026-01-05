import { UploadToServer } from "../../../../ServerLink/uploadToServer"
export const UploadToFunction = async (file: File): Promise<{job_id:string; file_id:string, file_type:string, task_id: string} | null> => {
  const file_type: string = (file.name.split('.').pop() ?? '').toUpperCase();
  let result = await UploadToServer(file, 'convert')
  if (!result) return null
  let job_id = result.job_id
  let file_id = result.file_id
  let task_id = result.task_id
  return {job_id, file_id, file_type, task_id}
};
