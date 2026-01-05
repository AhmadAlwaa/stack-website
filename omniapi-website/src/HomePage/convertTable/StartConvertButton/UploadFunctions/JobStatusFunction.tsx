import { checkJobStatus } from "../../../../ServerLink/checkJobStatus";
export const JobStatusFunction = async (job_id: string) => {
    while (true) {
        const res = await checkJobStatus(job_id);

        if (res.status === "finished") return true;
        if (res.status === "failed") return false;

        await new Promise(r => setTimeout(r, 500));
    }
};
