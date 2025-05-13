import 'dart:io';
import 'dart:convert';

class Reservation {
  String item;
  DateTime startDate;
  DateTime endDate;
  int duration;

  Reservation(this.item, this.startDate, this.endDate, this.duration);

  @override
  String toString() {
    return 'Réservation : $item - Du ${startDate.toIso8601String().split("T")[0]} au ${endDate.toIso8601String().split("T")[0]} ($duration jour(s))';
  }
}

List<Reservation> reservations = [];

DateTime parseDate(String input) {
  try {
    return DateTime.parse(input);
  } catch (_) {
    throw FormatException("Date invalide (format attendu : AAAA-MM-JJ)");
  }
}

bool isPeriodReserved(DateTime start, DateTime end, String item) {
  for (var res in reservations) {
    if (res.item.toLowerCase() == item.toLowerCase() &&
        start.isBefore(res.endDate.add(Duration(days: 1))) &&
        end.isAfter(res.startDate.subtract(Duration(days: 1)))) {
      return true;
    }
  }
  return false;
}

String makeReservation(String startDateStr, String durationStr, String item) {
  try {
    if (startDateStr.trim().isEmpty || durationStr.trim().isEmpty) {
      throw Exception("Date de début et durée sont requis");
    }

    int duration = int.tryParse(durationStr) ?? -1;
    if (duration < 1) {
      throw Exception("La durée doit être un nombre entier d'au moins 1 jour");
    }

    DateTime start = parseDate(startDateStr);
    DateTime end = start.add(Duration(days: duration - 1));

    if (isPeriodReserved(start, end, item)) {
      throw Exception("Cette période est déjà réservée pour $item");
    }

    reservations.add(Reservation(item, start, end, duration));
    return "Réservation confirmée pour $item du ${start.toIso8601String().split("T")[0]} pour $duration jour(s)";
  } catch (e) {
    return "Erreur : ${e.toString().replaceFirst('Exception: ', '')}";
  }
}

void listReservations() {
  if (reservations.isEmpty) {
    print("Aucune réservation");
    return;
  }

  for (int i = 0; i < reservations.length; i++) {
    print("Réservation ${i + 1}: ${reservations[i]}");
  }
}

Future<String> ask(String prompt) async {
  stdout.write(prompt);
  return stdin.readLineSync(encoding: utf8) ?? "";
}

bool validateItemChoice(String item) {
  if (item.trim().isEmpty) {
    print("Erreur : Le choix ne peut pas être vide");
    return false;
  }
  if (RegExp(r'\d').hasMatch(item)) {
    print("Erreur : Le choix ne peut pas contenir de chiffres");
    return false;
  }
  return true;
}

Future<String> chooseItem() async {
  while (true) {
    String item = await ask("Entrez l'objet à louer (ex. Voiture, Maison) : ");
    if (validateItemChoice(item)) return item.trim();
  }
}

Future<bool> reservationMenu(String item) async {
  print("\n=== Système de Réservation pour $item ===");
  print("1. Faire une réservation");
  print("2. Voir toutes les réservations");
  print("3. Quitter");

  String choice = await ask("Entrez votre choix (1-3) : ");

  switch (choice) {
    case "1":
      String startDate = await ask("Entrez la date de début (AAAA-MM-JJ) : ");
      String duration = await ask("Entrez la durée en jours (minimum 1) : ");
      print(makeReservation(startDate, duration, item));

      while (true) {
        String again = await ask(
          "Voulez-vous faire une nouvelle réservation ? (o/n) : ",
        );
        if (again.toLowerCase() == "o") {
          return false;
        } else if (again.toLowerCase() == "n") {
          return await postReservationMenu();
        } else {
          print("Veuillez entrer 'o' ou 'n'");
        }
      }

    case "2":
      listReservations();
      return false;

    case "3":
      print("Au revoir !");
      return true;

    default:
      print("Choix invalide, veuillez entrer 1, 2 ou 3");
      return false;
  }
}

Future<bool> postReservationMenu() async {
  while (true) {
    print("\n=== Options ===");
    print("1. Faire une nouvelle réservation");
    print("2. Voir les réservations");
    print("3. Quitter le programme");

    String choice = await ask("Entrez votre choix (1-3) : ");

    switch (choice) {
      case "1":
        String item = await chooseItem();
        return await reservationMenu(item);
      case "2":
        listReservations();
        break;
      case "3":
        print("Au revoir !");
        return true;
      default:
        print("Choix invalide, veuillez entrer 1, 2 ou 3");
    }
  }
}

Future<void> start() async {
  print("Bienvenue dans le système de réservation !");
  while (true) {
    String item = await chooseItem();
    bool quit = await reservationMenu(item);
    if (quit) break;
  }
}

void main() async {
  await start();
}
