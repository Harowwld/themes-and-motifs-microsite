import csv
import re
from datetime import datetime, timedelta

def excel_date_to_datetime(excel_date):
    try:
        val = int(float(excel_date))
        return datetime(1899, 12, 30) + timedelta(days=val)
    except:
        return None

def clean_date(d):
    d = str(d).strip()
    if not d or d.lower() in ["none", "na", "n/a", "this does not apply to me", "none yet", "not yet", "na "]:
        return ""
    
    if d.isdigit():
        dt = excel_date_to_datetime(d)
        if dt:
            return dt.strftime("%Y-%m-%d")
    
    if re.match(r'\d{2}-\d{2}-\d{4}', d):
        try:
            return datetime.strptime(d, "%m-%d-%Y").strftime("%Y-%m-%d")
        except:
            pass
            
    try:
        return datetime.strptime(d, "%b %d, %Y").strftime("%Y-%m-%d")
    except:
        pass

    try:
        return datetime.strptime(d, "%B %d %Y").strftime("%Y-%m-%d")
    except:
        pass

    if d.isdigit() and len(d) == 4:
        return f"{d}-01-01"

    return d

def clean_phone(p):
    p = str(p).strip()
    p = re.sub(r'\D', '', p)
    if not p:
        return "null"
    
    if len(p) == 12 and p.startswith("639"):
        return p
    if len(p) == 11 and p.startswith("09"):
        return "63" + p[1:]
    
    return "null"

def clean_string(s):
    s = str(s).strip()
    low = s.lower()
    if low in ["na", "n/a", "none", "none yet", "not yet", "same", "this does not apply to me", "not applicable to me", "none yeat"]:
        return ""
    return s

def clean_email(e):
    return str(e).strip().lower()

def main():
    input_file = '/Users/harold/Downloads/Ratings & Review  - Categories & Areas (For Rowi).xlsx - Seeded STWs.csv'
    output_file = '/Users/harold/Downloads/Cleaned_Seeded_STWs.csv'

    print(f"Reading from {input_file}")
    
    with open(input_file, 'r', encoding='utf-8-sig') as fin, open(output_file, 'w', encoding='utf-8', newline='') as fout:
        reader = csv.reader(fin)
        writer = csv.writer(fout)

        headers = next(reader)
        # Fix duplicate headers for clarity in output
        if len(headers) > 10:
            headers[9] = "Partner Mobile Phone Number"
            headers[10] = "Partner Email"
        writer.writerow(headers)

        cleaned_count = 0
        for row in reader:
            if not any(row):
                continue
                
            # Basic string clean for all cols
            row = [clean_string(c) for c in row]
            
            # Year of Birth
            if len(row) > 2:
                cd = clean_date(row[2])
                if cd and len(cd) >= 4:
                    row[2] = cd[:4]
                else:
                    row[2] = cd

            # Clean respondent phone and email
            if len(row) > 6:
                row[6] = clean_email(row[6])
                row[5] = clean_phone(row[5])
            
            # Clean partner phone and email
            if len(row) > 10:
                row[10] = clean_email(row[10])
                row[9] = clean_phone(row[9])
                
                # Check for duplicate email
                if row[6] and row[10] == row[6]:
                    row[10] = "" # Blank out partner email if it's the same
            
            # Clean Event Year
            if len(row) > 11:
                ey = clean_string(row[11])
                if ey.isdigit() and len(ey) == 4:
                    row[11] = ey
                else:
                    row[11] = ""
                    
            # Clean Date
            if len(row) > 12:
                row[12] = clean_date(row[12])
            
            writer.writerow(row)
            cleaned_count += 1
            
    print(f"Successfully cleaned {cleaned_count} rows.")
    print(f"Output written to {output_file}")

if __name__ == '__main__':
    main()
