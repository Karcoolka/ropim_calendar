export interface Event {
  id_zaznamu: number;
  unikatni_id: string;
  nazev_udalosti: string;
  id_udalosti: string;
  datum_zacatek: string;
  datum_konec: string;
  timestamp_zacatek: number;
  timestamp_konec: number;
  datum_vytvoreni?: string;
  popis_udalosti: string;
  misto_konani: string;
  organizator: string;
  url_udalosti: string;
  kategorie_id: number;
  kategorie_nazev: string;
  kategorie_rizika: string;
  je_aktivni_zaznam: string;
  je_verejny: string;
  dopad_do_systemu: string;
  oblast_pravni_upravy: string;
  pravni_predpis: string;
  typ_pravniho_predpisu: string;
  url_pravniho_predpisu: string;
  id_organu_verejne_moci: string;
  zkratka_uradu: string;
  zkratka_informacniho_systemu: string;
  kontaktni_osoba: string;
  utvar_kontaktni_osoby: string;
  dodavatel: string;
  prostredi: string;
  stav_udalosti: string;
  typ_odstavo_udalosti: string;
  dopad_na_ostatni_systemy: string;
  id_service_desk: string;
}

export interface FilterOptions {
  searchText: string;
  kategorie: string[];
  organVeejneMoci: string[];
  zkratkaIsvs: string[];
  datumOd: string;
  datumDo: string;
  rychlyDatumFilter: string;
} 