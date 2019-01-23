interface IStatus {
  [key: string]: string | number;

  name: string;
  gpuName: string;
  cpuUtil: number;
  gpuUtil: number;
  memUtil: number;
  gpuMemUtil: number;
  memTotal: number;
  gpuMemUsed: number;
  gpuMemTotal: number;
  gpuTemp: number;
  processes: string;
  updatedAt: string;
}

export default class Status implements Object, IStatus {
  [key: string]: string | number;

  name: string = '';
  gpuName: string = '';
  cpuUtil: number = -1;
  gpuUtil: number = -1;
  memUtil: number = -1;
  gpuMemUtil: number = -1;
  memTotal: number = -1;
  gpuMemUsed: number = -1;
  gpuMemTotal: number = -1;
  gpuTemp: number = -1;
  processes: string = '{}';
  updatedAt: string = '';

  constructor(init?: Partial<Status>) {
    Object.assign(this, init);
  }
}
