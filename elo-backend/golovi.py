# Podaci igrača: ime, klub, golovi za svaku sezonu
strijelci_2526_zelengaj = [
    ('Vilim Horvat', 4),
    ('Petar Dobrotić', 4),
    ('Matija Garić', 4),
    ('Davor Toplak', 2),
    ('Andrija Novaković', 2),
    ('Antun Smojvir', 2),
    ('Emil Golubić', 4),
    ('Marin Grđan', 1),
    ('Karlo Horvat', 1)
]

strijelci_2425_zelengaj = [
    ('Matija Garić', 18),
    ('Valentino Mlakar', 9),
    ('Vilim Horvat', 9),
    ('Antun Smojvir', 7),
    ('Andrija Novaković', 6),
    ('Lovro Magić', 2),
    ('Lovro Jurinić', 2),
    ('Marin Grđan', 2),
    ('Petar Sokol', 1),
    ('Karlo Horvat', 1)
]

strijelci_2324_zelengaj = [
    ('Matija Garić', 12),
    ('Vilim Horvat', 9),
    ('Ivan Miljković', 6),
    ('Leon Šaško', 5),
    ('Borna Petrovečki', 4),
    ('Dorian Hrman', 3),
    ('David Vrček', 3),
    ('Marin Grđan', 3),
    ('Ernest Horvat', 1),
    ('Nikola Sakač', 1),
    ('Emil Golubić', 1),
    ('Luka Primorac', 1),
    ('Lovro Jurinić', 1),
    ('Douglas De Souza Faustino', 1)
]



# Spojiti sve sezone u jednu listu
sve_sezone = strijelci_2324_zelengaj + strijelci_2425_zelengaj + strijelci_2526_zelengaj

# Suma golova i klubova po igraču
from collections import defaultdict

strijelci = defaultdict(lambda: {'golovi': 0, 'klubovi': set()})

for ime, golovi in sve_sezone:
    strijelci[ime]['golovi'] += golovi

# Sortirati top 10 po golovima
top10 = sorted(strijelci.items(), key=lambda x: x[1]['golovi'], reverse=True)[:10]

# Ispis rezultata
print(f"{'Ime':25} {'Golovi'}")
print('-'*85)
for ime, podatak in top10:
    print(f"{ime:25} {podatak['golovi']}")
