/** A Dhamma centre — physical retreat location. */
export interface Centre {
  id: string;
  name: string;
  nameNe?: string;
  city: string;
  region: string;
  country: string;
  flag?: string;
  altitude?: number;
  lat?: number;
  lng?: number;
}
