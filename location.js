const readline = require('node:readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let reservations = [];

function parseDate(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) throw new Error("Date invalide (format attendu : AAAA-MM-JJ)");
    return date;
}

function isPeriodReserved(startDate, endDate, item) {
    return reservations.some(res => {
        const resStart = new Date(res.startDate);
        const resEnd = new Date(res.endDate);
        return res.item === item && (startDate <= resEnd && endDate >= resStart);
    });
}

function makeReservation(startDateStr, durationDays, item) {
    try {
        if (!startDateStr || !durationDays) {
            throw new Error("Date de début et durée sont requis");
        }
        const duration = parseInt(durationDays);
        if (isNaN(duration) || duration < 1) {
            throw new Error("La durée doit être un nombre entier d'au moins 1 jour");
        }

        const startDate = parseDate(startDateStr);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + duration - 1);

        if (isPeriodReserved(startDate, endDate, item)) {
            throw new Error(`Cette période est déjà réservée pour ${item}`);
        }

        reservations.push({
            item: item,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            duration: duration
        });

        return `Réservation confirmée pour ${item} du ${startDate.toISOString().split('T')[0]} pour ${duration} jour(s)`;
    } catch (error) {
        return `Erreur : ${error.message}`;
    }
}

function listReservations() {
    if (reservations.length === 0) {
        return "Aucune réservation";
    }
    return reservations.map((res, index) => 
        `Réservation ${index + 1}: ${res.item} - Du ${res.startDate} au ${res.endDate} (${res.duration} jour(s))`
    ).join('\n');
}

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

function validateItemChoice(item) {
    if (!item || item.trim() === '') {
        return { valid: false, error: "Le choix ne peut pas être vide" };
    }
    if (/\d/.test(item)) {
        return { valid: false, error: "Le choix ne peut pas contenir de chiffres" };
    }
    return { valid: true };
}

async function chooseItem() {
    while (true) {
        const item = await question("Entrez l'objet à louer (ex. Voiture, Maison) : ");
        const validation = validateItemChoice(item);
        if (validation.valid) {
            return item.trim();
        } else {
            console.log(`Erreur : ${validation.error}`);
        }
    }
}

async function postReservationMenu() {
    while (true) {
        console.log("\n=== Options ===");
        console.log("1. Faire une nouvelle réservation");
        console.log("2. Voir les réservations");
        console.log("3. Quitter le programme");
        const choice = await question("Entrez votre choix (1-3) : ");
        
        if (choice === "1") {
            const item = await chooseItem();
            return await reservationMenu(item);
        } else if (choice === "2") {
            console.log(listReservations());
        } else if (choice === "3") {
            console.log("Au revoir !");
            return true; 
        } else {
            console.log("Choix invalide, veuillez entrer 1, 2 ou 3");
        }
    }
}

async function reservationMenu(item) {
    console.log(`\n=== Système de Réservation pour ${item} ===`);
    console.log("1. Faire une réservation");
    console.log("2. Voir toutes les réservations");
    console.log("3. Quitter");
    
    const choice = await question("Entrez votre choix (1-3) : ");
    
    if (choice === "1") {
        const startDate = await question("Entrez la date de début (AAAA-MM-JJ) : ");
        const duration = await question("Entrez la durée en jours (minimum 1) : ");
        console.log(makeReservation(startDate, duration, item));
        
        while (true) {
            const continueReservation = await question("Voulez-vous faire une nouvelle réservation ? (o/n) : ");
            if (continueReservation.toLowerCase() === "o") {
                return false; 
            } else if (continueReservation.toLowerCase() === "n") {
                return await postReservationMenu();
            } else {
                console.log("Veuillez entrer 'o' ou 'n'");
            }
        }
    } else if (choice === "2") {
        console.log(listReservations());
        return false; 
    } else if (choice === "3") {
        console.log("Au revoir !");
        return true;
    } else {
        console.log("Choix invalide, veuillez entrer 1, 2 ou 3");
        return false; 
    }
}
async function start() {
    console.log("Bienvenue dans le système de réservation !");
    while (true) {
        const item = await chooseItem();
        const shouldQuit = await reservationMenu(item);
        if (shouldQuit) {
            rl.close();
            break;
        }
    }
}

start();