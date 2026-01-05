import { convertToServer } from "../../../../ServerLink/convertToServer";
export const ConvertToFunction = async (id: string , format: string, file_type:string, task_id:string): Promise<{job_id:string; file_id:string} | null> => {
    const result = await convertToServer(id, file_type, format, 'convert', task_id)
    if (!result) return null
    const job_id = result.job_id
    const file_id = result.file_id
    return {job_id, file_id}
}