export interface Molo {
  id: number;
  nome: string;
  provincia: string;
  indirizzo?: string;
  capacita: number;
  posti_occupati?: number;
  stato?: string;
  posti_disponibili?: number;
}
