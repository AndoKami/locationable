use chrono::{NaiveDate, Duration};
use std::io::{self, Write};

#[derive(Debug, Clone)]
struct Reservation {
    item: String,
    start_date: NaiveDate,
    end_date: NaiveDate,
    duration: i64,
}

impl Reservation {
    fn display(&self, index: usize) -> String {
        format!(
            "Réservation {}: {} - Du {} au {} ({} jour(s))",
            index + 1,
            self.item,
            self.start_date,
            self.end_date,
            self.duration
        )
    }
}

fn parse_date(input: &str) -> Result<NaiveDate, String> {
    NaiveDate::parse_from_str(input, "%Y-%m-%d")
        .map_err(|_| "Date invalide (format attendu : AAAA-MM-JJ)".to_string())
}

fn is_period_reserved(reservations: &[Reservation], start: NaiveDate, end: NaiveDate, item: &str) -> bool {
    reservations.iter().any(|res| {
        res.item.eq_ignore_ascii_case(item)
            && start <= res.end_date
            && end >= res.start_date
    })
}

fn make_reservation(reservations: &mut Vec<Reservation>, start_str: &str, duration_str: &str, item: &str) -> String {
    if start_str.trim().is_empty() || duration_str.trim().is_empty() {
        return "Date de début et durée sont requis".to_string();
    }

    let duration: i64 = match duration_str.trim().parse() {
        Ok(d) if d >= 1 => d,
        _ => return "La durée doit être un nombre entier d'au moins 1 jour".to_string(),
    };

    let start_date = match parse_date(start_str) {
        Ok(date) => date,
        Err(e) => return e,
    };

    let end_date = start_date + Duration::days(duration - 1);

    if is_period_reserved(reservations, start_date, end_date, item) {
        return format!("Cette période est déjà réservée pour {}", item);
    }

    reservations.push(Reservation {
        item: item.to_string(),
        start_date,
        end_date,
        duration,
    });

    format!(
        "Réservation confirmée pour {} du {} pour {} jour(s)",
        item, start_date, duration
    )
}

fn list_reservations(reservations: &[Reservation]) {
    if reservations.is_empty() {
        println!("Aucune réservation");
    } else {
        for (i, res) in reservations.iter().enumerate() {
            println!("{}", res.display(i));
        }
    }
}

fn input(prompt: &str) -> String {
    print!("{}", prompt);
    io::stdout().flush().unwrap();

    let mut line = String::new();
    io::stdin().read_line(&mut line).unwrap();
    line.trim().to_string()
}

fn validate_item_choice(item: &str) -> Result<(), &str> {
    if item.trim().is_empty() {
        Err("Le choix ne peut pas être vide")
    } else if item.chars().any(|c| c.is_numeric()) {
        Err("Le choix ne peut pas contenir de chiffres")
    } else {
        Ok(())
    }
}

fn choose_item() -> String {
    loop {
        let item = input("Entrez l'objet à louer (ex. Voiture, Maison) : ");
        match validate_item_choice(&item) {
            Ok(_) => return item,
            Err(e) => println!("Erreur : {}", e),
        }
    }
}

fn reservation_menu(reservations: &mut Vec<Reservation>, item: &str) -> bool {
    println!("\n=== Système de Réservation pour {} ===", item);
    println!("1. Faire une réservation");
    println!("2. Voir toutes les réservations");
    println!("3. Quitter");

    let choice = input("Entrez votre choix (1-3) : ");
    match choice.as_str() {
        "1" => {
            let start_date = input("Entrez la date de début (AAAA-MM-JJ) : ");
            let duration = input("Entrez la durée en jours (minimum 1) : ");
            println!("{}", make_reservation(reservations, &start_date, &duration, item));

            loop {
                let again = input("Voulez-vous faire une nouvelle réservation ? (o/n) : ").to_lowercase();
                if again == "o" {
                    return false;
                } else if again == "n" {
                    return post_reservation_menu(reservations);
                } else {
                    println!("Veuillez entrer 'o' ou 'n'");
                }
            }
        }
        "2" => {
            list_reservations(reservations);
            false
        }
        "3" => {
            println!("Au revoir !");
            true
        }
        _ => {
            println!("Choix invalide, veuillez entrer 1, 2 ou 3");
            false
        }
    }
}

fn post_reservation_menu(reservations: &mut Vec<Reservation>) -> bool {
    loop {
        println!("\n=== Options ===");
        println!("1. Faire une nouvelle réservation");
        println!("2. Voir les réservations");
        println!("3. Quitter le programme");

        let choice = input("Entrez votre choix (1-3) : ");

        match choice.as_str() {
            "1" => {
                let item = choose_item();
                return reservation_menu(reservations, &item);
            }
            "2" => {
                list_reservations(reservations);
            }
            "3" => {
                println!("Au revoir !");
                return true;
            }
            _ => {
                println!("Choix invalide, veuillez entrer 1, 2 ou 3");
            }
        }
    }
}

fn main() {
    println!("Bienvenue dans le système de réservation !");
    let mut reservations: Vec<Reservation> = Vec::new();

    loop {
        let item = choose_item();
        let quit = reservation_menu(&mut reservations, &item);
        if quit {
            break;
        }
    }
}
