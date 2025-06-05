#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import mysql.connector
from datetime import datetime
from collections import Counter

# Database configuration
DB_CONFIG = {
    'host': '57.154.208.240',
    'port': 3306,
    'database': 'db',
    'user': 'germanShepherd',
    'password': 'LabradorBulldogHuski3Terri3rShibaInuMastiffDob3rmannRottw3iler@kita',
    'charset': 'utf8mb4',
    'autocommit': True
}

# Fixed SQL query based on actual database structure
COMPLETE_QUERY = """
SELECT 
    n.nid AS id_zaznamu,
    n.uuid AS unikatni_id,
    
    -- Základní informace o události
    COALESCE(nazev.field_nazev_udalosti_value, '') AS nazev_udalosti,
    COALESCE(id_ud.field_id_udalosti_value, '') AS id_udalosti,
    
    -- Data a časy
    FROM_UNIXTIME(datum.field_datumudalosti_value) AS datum_zacatek,
    FROM_UNIXTIME(datum.field_datumudalosti_end_value) AS datum_konec,
    COALESCE(datum.field_datumudalosti_value, 0) AS timestamp_zacatek,
    COALESCE(datum.field_datumudalosti_end_value, 0) AS timestamp_konec,
    FROM_UNIXTIME(vytvoreno.field_vytvoreno_value) AS datum_vytvoreni,
    
    -- Popisy a místa
    COALESCE(popis.field_popis_value, '') AS popis_udalosti,
    COALESCE(misto.field_egov_misto_udalosti_value, '') AS misto_konani,
    COALESCE(organizator.field_egov_organizator_value, '') AS organizator,
    COALESCE(url.field_egov_url_uri, '') AS url_udalosti,
    
    -- Kategorie
    COALESCE(kat.field_kategorie_target_id, 0) AS kategorie_id,
    COALESCE(kat_text.field_kategorie_text_value, '') AS kategorie_nazev,
    COALESCE(kat_rizika.field_kategorie_rizika_value, '') AS kategorie_rizika,
    
    -- Stavy
    CASE 
        WHEN aktivni.field_jeaktivnizaznam_value = 1 THEN 'ANO' 
        WHEN aktivni.field_jeaktivnizaznam_value = 0 THEN 'NE'
        ELSE 'NE' 
    END AS je_aktivni_zaznam,
    CASE 
        WHEN verejny.field_jeverejny_value = 1 THEN 'ANO' 
        WHEN verejny.field_jeverejny_value = 0 THEN 'NE'
        ELSE 'NE' 
    END AS je_verejny,
    CASE 
        WHEN dopad.field_dopad_do_systemu_value = 1 THEN 'ANO' 
        WHEN dopad.field_dopad_do_systemu_value = 0 THEN 'NE'
        ELSE 'NE' 
    END AS dopad_do_systemu,
    
    -- Legislativní informace
    COALESCE(leg_oblast.field_leg_oblast_pravni_upravy_value, '') AS oblast_pravni_upravy,
    COALESCE(leg_predpis.field_leg_pravni_predpis_value, '') AS pravni_predpis,
    COALESCE(leg_typ.field_leg_typ_value, '') AS typ_pravniho_predpisu,
    COALESCE(leg_url.field_leg_url_uri, '') AS url_pravniho_predpisu,
    
    -- Organizační informace
    COALESCE(id_ovm.field_id_ovm_value, '') AS id_organu_verejne_moci,
    COALESCE(zkratka_ovm.field_zkratka_ovm_value, '') AS zkratka_uradu,
    COALESCE(zkratka_isvs.field_zkratka_isvs_value, '') AS zkratka_informacniho_systemu,
    
    -- Kontaktní informace
    COALESCE(kontakt.field_kontaktni_osoba_pro_isvs_o_value, '') AS kontaktni_osoba,
    COALESCE(utvar.field_utvar_kontaktni_osoby_ovm_value, '') AS utvar_kontaktni_osoby,
    
    -- Technické informace pro odstávky
    COALESCE(odst_dodavatel.field_odst_dodavatel_value, '') AS dodavatel,
    COALESCE(odst_prostredi.field_odst_prostredi_value, '') AS prostredi,
    COALESCE(odst_stav.field_odst_stav_value, '') AS stav_udalosti,
    COALESCE(odst_typ.field_odst_typ_udalosti_value, '') AS typ_odstavo_udalosti,
    COALESCE(odst_dopad.field_odst_dopad_na_ostatni_syst_value, '') AS dopad_na_ostatni_systemy,
    COALESCE(odst_sd.field_odst_id_sd_value, '') AS id_service_desk

FROM db.node n

-- Základní informace
LEFT JOIN db.node__field_nazev_udalosti nazev ON n.nid = nazev.entity_id
LEFT JOIN db.node__field_id_udalosti id_ud ON n.nid = id_ud.entity_id
LEFT JOIN db.node__field_vytvoreno vytvoreno ON n.nid = vytvoreno.entity_id

-- Datum a čas
LEFT JOIN db.node__field_datumudalosti datum ON n.nid = datum.entity_id

-- Popisy a místa
LEFT JOIN db.node__field_popis popis ON n.nid = popis.entity_id
LEFT JOIN db.node__field_egov_misto_udalosti misto ON n.nid = misto.entity_id
LEFT JOIN db.node__field_egov_organizator organizator ON n.nid = organizator.entity_id
LEFT JOIN db.node__field_egov_url url ON n.nid = url.entity_id

-- Kategorie
LEFT JOIN db.node__field_kategorie kat ON n.nid = kat.entity_id
LEFT JOIN db.node__field_kategorie_text kat_text ON n.nid = kat_text.entity_id
LEFT JOIN db.node__field_kategorie_rizika kat_rizika ON n.nid = kat_rizika.entity_id

-- Stavy
LEFT JOIN db.node__field_jeaktivnizaznam aktivni ON n.nid = aktivni.entity_id
LEFT JOIN db.node__field_jeverejny verejny ON n.nid = verejny.entity_id
LEFT JOIN db.node__field_dopad_do_systemu dopad ON n.nid = dopad.entity_id

-- Legislativní informace
LEFT JOIN db.node__field_leg_oblast_pravni_upravy leg_oblast ON n.nid = leg_oblast.entity_id
LEFT JOIN db.node__field_leg_pravni_predpis leg_predpis ON n.nid = leg_predpis.entity_id
LEFT JOIN db.node__field_leg_typ leg_typ ON n.nid = leg_typ.entity_id
LEFT JOIN db.node__field_leg_url leg_url ON n.nid = leg_url.entity_id

-- Organizační informace
LEFT JOIN db.node__field_id_ovm id_ovm ON n.nid = id_ovm.entity_id
LEFT JOIN db.node__field_zkratka_ovm zkratka_ovm ON n.nid = zkratka_ovm.entity_id
LEFT JOIN db.node__field_zkratka_isvs zkratka_isvs ON n.nid = zkratka_isvs.entity_id

-- Kontaktní informace
LEFT JOIN db.node__field_kontaktni_osoba_pro_isvs_o kontakt ON n.nid = kontakt.entity_id
LEFT JOIN db.node__field_utvar_kontaktni_osoby_ovm utvar ON n.nid = utvar.entity_id

-- Technické informace pro odstávky
LEFT JOIN db.node__field_odst_dodavatel odst_dodavatel ON n.nid = odst_dodavatel.entity_id
LEFT JOIN db.node__field_odst_prostredi odst_prostredi ON n.nid = odst_prostredi.entity_id
LEFT JOIN db.node__field_odst_stav odst_stav ON n.nid = odst_stav.entity_id
LEFT JOIN db.node__field_odst_typ_udalosti odst_typ ON n.nid = odst_typ.entity_id
LEFT JOIN db.node__field_odst_dopad_na_ostatni_syst odst_dopad ON n.nid = odst_dopad.entity_id
LEFT JOIN db.node__field_odst_id_sd odst_sd ON n.nid = odst_sd.entity_id

WHERE n.type = 'udalost_kalendar'
ORDER BY datum.field_datumudalosti_value DESC;
"""

def fetch_events_data():
    """Fetch all events from database and return as list of dictionaries"""
    try:
        print("Připojuji se k databázi...")
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        print("Spouštím dotaz na načtení událostí...")
        cursor.execute(COMPLETE_QUERY)
        results = cursor.fetchall()
        
        print(f"Načteno {len(results)} událostí z databáze")
        
        # Convert datetime and other objects to strings for JSON serialization
        events = []
        for row in results:
            event = {}
            for key, value in row.items():
                if isinstance(value, datetime):
                    event[key] = value.strftime('%Y-%m-%d %H:%M:%S')
                elif value is None:
                    event[key] = ''
                elif hasattr(value, '__float__'):  # Decimal type
                    event[key] = float(value)
                elif hasattr(value, '__int__'):  # Other numeric types
                    event[key] = int(value)
                else:
                    event[key] = str(value)
            
            # Generate fallback name if missing
            if not event.get('nazev_udalosti'):
                if event.get('kategorie_nazev'):
                    event['nazev_udalosti'] = f"Událost {event.get('kategorie_nazev')} #{event.get('id_zaznamu')}"
                else:
                    event['nazev_udalosti'] = f"Událost #{event.get('id_zaznamu')}"
            
            events.append(event)
        
        cursor.close()
        connection.close()
        
        return events
        
    except mysql.connector.Error as err:
        print(f"Chyba databáze: {err}")
        return []
    except Exception as e:
        print(f"Obecná chyba: {e}")
        return []

def get_categories_with_counts(events):
    """Extract categories with event counts"""
    categories = {}
    for event in events:
        cat_name = event.get('kategorie_nazev', '').strip()
        if cat_name:
            if cat_name in categories:
                categories[cat_name] += 1
            else:
                categories[cat_name] = 1
    
    # Add default categories if they don't exist
    default_categories = [
        'Akce eGovernmentu',
        'veřejná událost', 
        'legislativní událost',
        'událost ISVS'
    ]
    
    for cat in default_categories:
        if cat not in categories:
            categories[cat] = 0
    
    return [
        {"id": i+1, "nazev": cat, "count": count}
        for i, (cat, count) in enumerate(categories.items())
    ]

def get_unique_urady(events):
    """Extract unique government offices with better names"""
    urady = {}
    for event in events:
        ovm_id = event.get('id_organu_verejne_moci', '').strip()
        zkratka = event.get('zkratka_uradu', '').strip()
        
        if ovm_id:
            if zkratka:
                urady[ovm_id] = zkratka
            else:
                # Better extraction from OVM ID
                if '/' in ovm_id:
                    numeric_part = ovm_id.split('/')[-1]
                    urady[ovm_id] = f"Úřad ({numeric_part})"
                else:
                    urady[ovm_id] = f"Úřad {ovm_id}"
    
    # Add some fallback options with real names
    if not urady:
        urady = {
            'orgán-veřejné-moci/17651921': 'Digitální a informační agentura',
            'orgán-veřejné-moci/66003369': 'Ministerstvo vnitra',
            'orgán-veřejné-moci/00025593': 'Úřad vlády ČR'
        }
    
    return [
        {"id": ovm_id, "nazev": nazev}
        for ovm_id, nazev in urady.items()
    ]

def get_isvs_systems(events):
    """Extract ISVS systems with both abbreviations and full names"""
    isvs_data = {}
    
    for event in events:
        zkratka = event.get('zkratka_informacniho_systemu', '').strip()
        if zkratka:
            # Try to extract or guess full name
            full_name = get_isvs_full_name(zkratka)
            isvs_data[zkratka] = full_name
    
    # Add some common systems if missing
    default_isvs = {
        'ISDS': 'Informační systém datových schránek',
        'ISSS': 'Informační systém statistiky a reportingu',
        'Portál občana': 'Portál občana České republiky',
        'eDoklady': 'Elektronické doklady',
        'e-Legislativa': 'Systém elektronické legislativy'
    }
    
    for zkratka, full_name in default_isvs.items():
        if zkratka not in isvs_data:
            isvs_data[zkratka] = full_name
    
    return [
        {"id": zkratka, "zkratka": zkratka, "nazev": full_name}
        for zkratka, full_name in isvs_data.items()
    ]

def get_isvs_full_name(zkratka):
    """Map ISVS abbreviations to full names"""
    mapping = {
        'ISDS': 'Informační systém datových schránek',
        'ISSS': 'Informační systém statistiky a reportingu', 
        'Portál občana': 'Portál občana České republiky',
        'eDoklady': 'Elektronické doklady',
        'e-Legislativa': 'Systém elektronické legislativy',
        'CzP': 'Czech POINT',
        'eMatrika': 'Elektronická matrika',
        'eSSL': 'Elektronický systém správy dokumentů',
        'RÚIAN': 'Registr územní identifikace, adres a nemovitostí',
        'ROB': 'Registr osob a bytů'
    }
    
    return mapping.get(zkratka, f"Informační systém {zkratka}")

def generate_search_suggestions(events):
    """Generate search suggestions from all event data"""
    suggestions = set()
    
    for event in events:
        # Add event names
        nazev = event.get('nazev_udalosti', '').strip()
        if nazev and len(nazev) > 3:
            suggestions.add(nazev)
        
        # Add organizations
        organizator = event.get('organizator', '').strip()
        if organizator and len(organizator) > 3:
            suggestions.add(organizator)
        
        # Add locations
        misto = event.get('misto_konani', '').strip()
        if misto and len(misto) > 3:
            suggestions.add(misto)
        
        # Add categories
        kategorie = event.get('kategorie_nazev', '').strip()
        if kategorie:
            suggestions.add(kategorie)
        
        # Add key words from descriptions
        popis = event.get('popis_udalosti', '').strip()
        if popis:
            # Extract meaningful words (longer than 4 characters)
            words = popis.replace('\r\n', ' ').replace('\n', ' ').split()
            for word in words:
                clean_word = word.strip('.,!?:;()[]{}"-').strip()
                if len(clean_word) > 4 and clean_word.isalpha():
                    suggestions.add(clean_word)
    
    # Convert to list and sort
    suggestions_list = sorted(list(suggestions))
    
    # Create suggestion objects with frequency
    word_counts = Counter()
    for event in events:
        text_content = ' '.join([
            event.get('nazev_udalosti', ''),
            event.get('popis_udalosti', ''),
            event.get('organizator', ''),
            event.get('misto_konani', ''),
            event.get('kategorie_nazev', '')
        ]).lower()
        
        for suggestion in suggestions_list:
            if suggestion.lower() in text_content:
                word_counts[suggestion] += 1
    
    return [
        {
            "id": suggestion,
            "label": suggestion,
            "count": word_counts.get(suggestion, 1)
        }
        for suggestion in suggestions_list[:100]  # Limit to top 100
    ]

def main():
    print("=== Stahování dat z databáze ===")
    
    # Fetch main events data
    events = fetch_events_data()
    if not events:
        print("Nepodařilo se načíst žádná data!")
        return
    
    # Generate supporting data
    categories = get_categories_with_counts(events)
    urady = get_unique_urady(events)
    isvs_systems = get_isvs_systems(events)
    search_suggestions = generate_search_suggestions(events)
    
    # Save to JSON files
    print("\nUkládám data do JSON souborů...")
    
    with open('src/data/events.json', 'w', encoding='utf-8') as f:
        json.dump(events, f, ensure_ascii=False, indent=2)
    print(f"✅ Uloženo {len(events)} událostí do src/data/events.json")
    
    with open('src/data/categories.json', 'w', encoding='utf-8') as f:
        json.dump(categories, f, ensure_ascii=False, indent=2)
    print(f"✅ Uloženo {len(categories)} kategorií do src/data/categories.json")
    
    with open('src/data/urady.json', 'w', encoding='utf-8') as f:
        json.dump(urady, f, ensure_ascii=False, indent=2)
    print(f"✅ Uloženo {len(urady)} úřadů do src/data/urady.json")
    
    with open('src/data/isvs.json', 'w', encoding='utf-8') as f:
        json.dump(isvs_systems, f, ensure_ascii=False, indent=2)
    print(f"✅ Uloženo {len(isvs_systems)} ISVS systémů do src/data/isvs.json")
    
    with open('src/data/search-suggestions.json', 'w', encoding='utf-8') as f:
        json.dump(search_suggestions, f, ensure_ascii=False, indent=2)
    print(f"✅ Uloženo {len(search_suggestions)} návrhů vyhledávání do src/data/search-suggestions.json")
    
    # Print sample data
    print(f"\n=== Ukázka dat ===")
    if events:
        sample = events[0]
        print(f"První událost: {sample.get('nazev_udalosti', 'N/A')}")
        print(f"Datum: {sample.get('datum_zacatek', 'N/A')}")
        print(f"Kategorie: {sample.get('kategorie_nazev', 'N/A')}")
    
    # Print summary
    print(f"\n=== Souhrn dat ===")
    print(f"Celkem událostí: {len(events)}")
    print(f"Kategorie: {[cat['nazev'] for cat in categories]}")
    print(f"Úřady: {[urad['nazev'] for urad in urady[:5]]}{'...' if len(urady) > 5 else ''}")
    print(f"ISVS systémy: {[isvs['zkratka'] for isvs in isvs_systems]}")
    print(f"Návrhů vyhledávání: {len(search_suggestions)}")

if __name__ == "__main__":
    main() 