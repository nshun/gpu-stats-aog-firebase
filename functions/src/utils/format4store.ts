import IReqBody from '../interfaces/IReqBody';
import Status from '../entities/Status';
import * as moment from 'moment';

/**
 *
 * @param postData
 * results of : { cpu, gpu, process }
 * * [name, cpuUtil, memUtil, memTotal]
 * * nvidia-smi --query-gpu=name,temperature.gpu,utilization.gpu,utilization.memory,memory.total --format=csv,noheader,nounits
 * * nvidia-smi --query-compute-apps=pid,name,used_memory --format=csv,noheader,nounits
 */
export default function formatData(reqBody: IReqBody): Status {
  let status: Status;
  try {
    const { cpu, gpu, process } = reqBody;
    const parsedCPU = cpu.split(',');
    const parsedGPU = gpu.split(',');
    const parsedProcess = process || ['no process'];

    status = {
      name: parsedCPU[0],
      gpuName: parsedGPU[0],
      cpuUtil: parseInt(parsedCPU[1], 10),
      gpuUtil: parseInt(parsedGPU[1], 10),
      memUtil: parseInt(parsedCPU[2], 10),
      gpuMemUtil: parseInt(parsedGPU[2], 10),
      memTotal: parseInt(parsedCPU[3], 10),
      gpuMemUsed: parseInt(parsedGPU[3], 10),
      gpuMemTotal: parseInt(parsedGPU[4], 10),
      gpuTemp: parseInt(parsedGPU[5], 10),
      processes: `{${parsedProcess}}`,
      updatedAt: moment().utcOffset("+09:00").format('YYYY年MM月DD日 HH:mm:ss'),
    };
  } catch (error) {
    status = new Status();
    console.error(error);
  }
  return status;
}
