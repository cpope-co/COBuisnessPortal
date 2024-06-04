export type Register = {
  usemail: string;
  verifyEmail: string;
  usfname: string;
  uslname: string;
  usabnum?: number;
  wcatmgr?: number;
  wacctname: string;
  wregtype: RegistrationTypes;
  wphone: string;
  wrecaptchatoken: string;
}

export enum RegistrationTypes {
  s = 'Supplier',
  r = 'Retailer',
}

