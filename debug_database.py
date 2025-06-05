#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import mysql.connector

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

def check_table_columns(table_name):
    """Check columns in a specific table"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor()
        
        cursor.execute(f"DESCRIBE db.{table_name}")
        columns = cursor.fetchall()
        
        print(f"\n=== Tabulka: {table_name} ===")
        for col in columns:
            print(f"  {col[0]} - {col[1]}")
        
        cursor.close()
        connection.close()
        
        return [col[0] for col in columns]
        
    except mysql.connector.Error as err:
        print(f"Chyba při kontrole tabulky {table_name}: {err}")
        return []

def check_field_tables():
    """Check all field tables structure"""
    
    # Key tables we need to check
    tables_to_check = [
        'node__field_nazev_udalosti',
        'node__field_datumudalosti', 
        'node__field_egov_url',
        'node__field_kategorie_text',
        'node__field_id_ovm',
        'node__field_zkratka_isvs'
    ]
    
    all_columns = {}
    
    for table in tables_to_check:
        columns = check_table_columns(table)
        all_columns[table] = columns
    
    return all_columns

def test_simple_query():
    """Test a simple query to see what works"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        cursor = connection.cursor(dictionary=True)
        
        # Simple query first
        query = """
        SELECT 
            n.nid,
            n.uuid,
            nazev.field_nazev_udalosti_value,
            datum.field_datumudalosti_value,
            datum.field_datumudalosti_end_value
        FROM db.node n
        LEFT JOIN db.node__field_nazev_udalosti nazev ON n.nid = nazev.entity_id
        LEFT JOIN db.node__field_datumudalosti datum ON n.nid = datum.entity_id
        WHERE n.type = 'udalost_kalendar'
        LIMIT 5;
        """
        
        print("\n=== Testování jednoduchého dotazu ===")
        cursor.execute(query)
        results = cursor.fetchall()
        
        print(f"Načteno {len(results)} záznamů:")
        for i, row in enumerate(results):
            print(f"  {i+1}. {row}")
        
        cursor.close()
        connection.close()
        
    except mysql.connector.Error as err:
        print(f"Chyba při testování dotazu: {err}")

def main():
    print("=== Debug databázové struktury ===")
    
    # Check table structures
    columns = check_field_tables()
    
    # Test simple query
    test_simple_query()
    
    print("\n=== Shrnutí ===")
    for table, cols in columns.items():
        print(f"{table}: {cols}")

if __name__ == "__main__":
    main() 