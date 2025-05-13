const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function marmite() {
    rl.question("Entrez un aliment à cuire : ", (aliment) => {
        console.log("Choisissez le type de cuisson :");
        console.log("1. Frit");
        console.log("2. Mijoté");
        console.log("3. Rôti");

        rl.question("Entrez le numéro correspondant au type de cuisson : ", (typeCuisson) => {
            let cuisson;
            switch (typeCuisson) {
                case '1':
                    cuisson = "frit";
                    break;
                case '2':
                    cuisson = "mijoté";
                    break;
                case '3':
                    cuisson = "rôti";
                    break;
                default:
                    console.log("Type de cuisson invalide. Par défaut, mijoté sera utilisé.");
                    cuisson = "mijoté";
            }

            console.log(`Temps de cuisson pour ${aliment} (${cuisson}) : 20 minutes (simulé en 2 secondes).`);
            console.log("Appuyez sur Entrée pour commencer la cuisson...");

            rl.on('line', () => {
                console.log(`Cuisson de ${aliment} (${cuisson}) en cours...`);
                setTimeout(() => {
                    console.log(`${aliment} (${cuisson}) est maintenant cuit !`);
                    rl.close();
                }, 2000); // Simule 2 secondes de cuisson
            });
        });
    });
}

marmite();