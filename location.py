import datetime

reservations = []

def parse_date(date_str):
    try:
        return datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise ValueError("Date invalide (format attendu : AAAA-MM-JJ)")

def is_period_reserved(start_date, end_date, item):
    for res in reservations:
        res_start = parse_date(res['startDate'])
        res_end = parse_date(res['endDate'])
        if res['item'].lower() == item.lower() and (start_date <= res_end and end_date >= res_start):
            return True
    return False

def make_reservation(start_date_str, duration_days, item):
    try:
        if not start_date_str or not duration_days:
            raise ValueError("Date de début et durée sont requis")

        duration = int(duration_days)
        if duration < 1:
            raise ValueError("La durée doit être un nombre entier d'au moins 1 jour")

        start_date = parse_date(start_date_str)
        end_date = start_date + datetime.timedelta(days=duration - 1)

        if is_period_reserved(start_date, end_date, item):
            raise ValueError(f"Cette période est déjà réservée pour {item}")

        reservations.append({
            "item": item,
            "startDate": start_date.isoformat(),
            "endDate": end_date.isoformat(),
            "duration": duration
        })

        return f"Réservation confirmée pour {item} du {start_date.isoformat()} pour {duration} jour(s)"
    except Exception as e:
        return f"Erreur : {e}"

def list_reservations():
    if not reservations:
        return "Aucune réservation"
    lines = []
    for idx, res in enumerate(reservations, 1):
        lines.append(
            f"Réservation {idx}: {res['item']} - Du {res['startDate']} au {res['endDate']} ({res['duration']} jour(s))"
        )
    return "\n".join(lines)

def validate_item_choice(item):
    if not item.strip():
        return False, "Le choix ne peut pas être vide"
    if any(char.isdigit() for char in item):
        return False, "Le choix ne peut pas contenir de chiffres"
    return True, ""

def choose_item():
    while True:
        item = input("Entrez l'objet à louer (ex. Voiture, Maison) : ").strip()
        valid, error = validate_item_choice(item)
        if valid:
            return item
        else:
            print(f"Erreur : {error}")

def reservation_menu(item):
    print(f"\n=== Système de Réservation pour {item} ===")
    print("1. Faire une réservation")
    print("2. Voir toutes les réservations")
    print("3. Quitter")
    choice = input("Entrez votre choix (1-3) : ").strip()

    if choice == "1":
        start_date = input("Entrez la date de début (AAAA-MM-JJ) : ").strip()
        duration = input("Entrez la durée en jours (minimum 1) : ").strip()
        print(make_reservation(start_date, duration, item))

        while True:
            cont = input("Voulez-vous faire une nouvelle réservation ? (o/n) : ").strip().lower()
            if cont == "o":
                return False
            elif cont == "n":
                return post_reservation_menu()
            else:
                print("Veuillez entrer 'o' ou 'n'")
    elif choice == "2":
        print(list_reservations())
        return False
    elif choice == "3":
        print("Au revoir !")
        return True
    else:
        print("Choix invalide, veuillez entrer 1, 2 ou 3")
        return False

def post_reservation_menu():
    while True:
        print("\n=== Options ===")
        print("1. Faire une nouvelle réservation")
        print("2. Voir les réservations")
        print("3. Quitter le programme")
        choice = input("Entrez votre choix (1-3) : ").strip()

        if choice == "1":
            item = choose_item()
            return reservation_menu(item)
        elif choice == "2":
            print(list_reservations())
        elif choice == "3":
            print("Au revoir !")
            return True
        else:
            print("Choix invalide, veuillez entrer 1, 2 ou 3")

def start():
    print("Bienvenue dans le système de réservation !")
    while True:
        item = choose_item()
        should_quit = reservation_menu(item)
        if should_quit:
            break

if __name__ == "__main__":
    start()
