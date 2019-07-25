import * as assert from "assert";
import * as vm from 'vm';

import { convert } from "../../src/converter/converter";
import { augmentify, augmentifyOperators } from "../../src/augmentations/index";
import { augmentifyArray } from "../../src/augmentations/array";

const template = `
(function() {
debugger;
augmentifyOperators(this);
augmentifyArray(Array);
{{code}}
})();
`;

const execute = (str: string, ctx: any, expected: any) => {
    const result = template.replace("{{code}}", convert(str, { context: ctx, keepComments: true }));

    const context = vm.createContext();
    Object.assign(context, augmentifyOperators(ctx), { augmentifyOperators, augmentifyArray });

    const script = new vm.Script(result);
    const actual = script.runInContext(context) as any[];

    assert(actual === expected);
};

describe("Ultimate", () => {
    it.only("should parse the given code", () => {
        execute(`
        def header = "";
        def content = "";
        def gainTotal = 0;
        def displayGain = "-";

        def gains = []

        def writeHeader = {
            header = header + "<style type=\\"text/css\\">";
            header = header + ".fondNoir {background-color: #002b58; color: #FFFFFF; font-weight: bold; text-align: center; }";
            header = header + ".fondGris {background-color: #004e9e; color: #FFFFFF; font-weight: bold; text-align: center; }";
            header = header + ".tableaux { margin: auto; border-spacing: 0; }";
            header = header + "table.tableaux td { border:1px solid black; }";
            header = header + ".alignGauche { text-align: left; }";
            header = header + ".alignCentre { text-align: center; }";
            header = header + ".alignDroite { text-align: right; }";
            header = header + ".gagne { background-color: #9b2629; color: #FFFFFF; }";
            header = header + "</style>";
        }

        def writeStart = {
            def evt = it.eventResponse;
            bet = evt.bet / 100;

            content = content + "<table class=\\"tableaux\\" width=\\"100%\\">";
            content = content + "<tbody>";
            content = content + "<tr class=\\"fondNoir\\">";
            content = content + "<td>KENO ATLANTIA</td>";
            content = content + "</tr>";
            content = content + "<tr class=\\"fondGris\\">";
            content = content + "<td>Mise : " + bet + "&euro; / Gains : {gainTotal}&euro;</td>";
            content = content + "</tr>";
            content = content + "<tr class=\\"fondNoir\\">";
            content = content + "<td>D&eacute;tails de la prise de jeu</td>";
            content = content + "</tr>";
        }

        def writeEnd = {
            def totalEnd = gainTotal / 100;
            content = content + "<table class=\\"tableaux\\" width=\\"90%\\">";
            content = content + "<tbody>";
            content = content + "<tr class=\\"fondNoir\\">";
            content = content + "<td>Montant gain final : " + totalEnd + "&euro;</td>";
            content = content + "</tr>";
            content = content + "</tbdody>";
            content = content + "</table>";
        }

        def writeDraw = {
            def params = it.eventParams
            def evt = it.eventResponse
            def model = constants.gains[params.num.size()]

            generatedNums = evt.dnu
            foundNums = evt.nwi

            // Header
            /*
            content = content + "<tr>";
              content = content + "<td class=\\"alignCentre\\">" + evt + "</td>";
              content = content + "</tr>";
            */
            
            /*
            content = content + "<tr>";
              content = content + "<td class=\\"alignCentre\\">" + params + "</td>";
              content = content + "</tr>";
            */
            
            /*
            content = content + "<tr>";
              content = content + "<td class=\\"alignCentre\\">" + generatedNums + "</td>";
              content = content + "</tr>";
            */

            content = content + "<tr>";
              content = content + "<td class=\\"alignCentre\\">Nombre de numéros choisis : " + params.num.size() + "</td>";

            // Liste des choix
            content = content + "<!-- tableau de la revelation -->";
            content = content + "<table class=\\"tableaux\\" width=\\"90%\\">";
            content = content + "<tbody>";
            content = content + "<tr class=\\"fondGris\\">";
            content = content + "<td colspan=\\"2\\">Liste des choix</td>";
            content = content + "</tr>";
            content = content + "<tr>";
            content = content + "<td>Num&eacute;ros choisis : " + params.num[0] + " - " + params.num[1];

            for (i = 2; i < params.num.size(); i++) {
                content = content + " - " + params.num[i];
            }

            content = content + "<br/>";

            content = content + "Chance de gagner : 1/" + model.chance + "<br />";

            // Tableau
            content = content + "Tableau de gains correspondant :" + "<br />";
            content = content + "<table class=\\"tableaux\\" width=\\"30%\\">";
            content = content + "<tbdody>";

            content = content + "<tr class=\\"fondNoir\\">";
            content = content + "<td>Nombre de n° trouvés</td>";
            content = content + "<td>Gains</td>";
            content = content + "</tr>";

            for (i = 0; i < model.prizes.size(); i++) {
                content = content + "<tr>";
                content = content + "<td>" + model.prizes[i].nbMatch + "</td>";

                def nbMatchGain = model.prizes[i].gain / 100;
                content = content + "<td>" + nbMatchGain + "&euro;</td>";
                content = content + "</tr>";
            }

            content = content + "</tbdody>";
            content = content + "</table>";

            // Date
            content = content + "</td>";
            content = content + "<td class=\\"alignDroite\\">";
            content = content + "(" + formatDate( it.dateOfEvent ) + ") <br/>";
            content = content + "</td>";
            content = content + "</tr>";

            content = content + "</tr>"; // Nombre de numéros choisis

            content = content + "</tbdody>";
            content = content + "</table>";

            // Legende
            content = content + "<!-- Legende -->";
            content = content + "<table class=\\"tableaux\\" width=\\"90%\\">";
            content = content + "<tbody>";
            content = content + "<tr class=\\"fondGris\\">";
            content = content + "<td colspan=\\"2\\">L&eacute;gende</td>";
            content = content + "</tr>";

            content = content + "<tr>";
            content = content + "<td class=\\"alignCentre\\">Grille valid&eacute;e</td>";
            content = content + "</tr>";

            def gainMax = model.prizes[0].gain / 100;
            content = content + "<tr>";
            content = content + "<td>Gain max : " + gainMax + "&euro;</td>";
            content = content + "</tr>";

            content = content + "<tr>";
            content = content + "<td>Chance de gagner : 1 / " + model.chance + "</td>";
            content = content + "</tr>";
            // Tableau
            content = content + "<table class=\\"tableaux\\" width=\\"50%\\">";
            content = content + "<tbdody>";

            def num = 0;

            for (i = 0; i < 5; i++) {
                content = content + "<tr>";
                for (j = 0; j < 8; j++) {
                    num = j + (i * 8) + 1;

                    if (params.num.contains(num)) {
                        content = content + "<td style=\\"background-color: yellow;\\">" + num + "</td>";
                    }
                    else {
                        content = content + "<td>" + num + "</td>";
                    }
                }
                content = content + "</tr>";
            }

            content = content + "</tbdody>";
            content = content + "</table>";

            content = content + "</tbdody>";
            content = content + "</table>";

            // Révélation
            content = content + "<!-- Revelation -->";
            content = content + "<table class=\\"tableaux\\" width=\\"90%\\">";
            content = content + "<tbody>";
            content = content + "<tr class=\\"fondGris\\">";
            content = content + "<td colspan=\\"2\\">R&eacute;v&eacute;lation</td>";
            content = content + "</tr>";

            content = content + "<tr>";
                content = content + "<td>Numéros tirés : " + generatedNums[0];
                for (i = 1; i < generatedNums.size(); i++) {
                    content = content + " - " + generatedNums[i];
                }
                content = content + "</td>";
                content = content + "<td class=\\"alignDroite\\">" + formatDate( it.dateOfEvent ) + "</td>";
            content = content + "</tr>";

            content = content + "<tr>";
                // Nombre de numéros gagants
                content = content + "<td>";
                content = content + "<b>Nombre de num&eacute;ros gagnants : " + foundNums.size() + "</b><br />";
                if (foundNums.size() < model.prizes[model.prizes.size() - 1].nbMatch) {
                    content = content + "<b>D&eacute;tail des numeros gagnants : 0</b><br />";
                    content = content + "-> Partie perdante";
                }
                else {
                    content = content + "<b>D&eacute;tail des num&eacute;ros gagnants : </b>" + foundNums[0];
                    for (i = 1; i < foundNums.size(); i++) {
                        content = content + " - " + foundNums[i];
                    }

                    content = content + "<br />";
                    content = content + "-> Partie gagnante";
                }
                content = content + "</td>";

                // Détail des numéros gagnants
                content = content + "<td>";
                content = content + "</td>";

            content = content + "</tr>";
            
            content = content + "</tbdody>";
            content = content + "</table>";
        }

        // Write histo
        writeHeader();

        events.sort {a, b -> a.dateOfEvent <=> b.dateOfEvent}
        events.each() {
            switch (it.eventName) {
                case 'init':
                    writeStart(it);
                    break
                
                case 'dra':
                    gainTotal = it.eventResponse.win;
                    writeDraw(it);
                    break
            }
        };

        writeEnd();

        // Polish
        if(gainTotal != -1) {
            displayGain = ( gainTotal / 100 ) + "";
        }

        content = content.replace( "{gainTotal}",  displayGain );

        return header + content;
        `, {
            multipleSampleWoutReplacement: () => { },
            addInResult: () => { },
            removeUniver: () => { },
            payAmount: () => { },
            param: {
                num: [1, 2, 3]
            },
            constants: {
                nbDrawNum: 14,
                gains: [{ prizes: [{ nbMatch: 0, gain: 0 }] }]
            },
            session: {
                gameData: {
                    gme: {
                        nma: 0,
                        nwi: [],
                        num: [],
                        win: 0
                    }
                }
            }
        }, true);
    });
});