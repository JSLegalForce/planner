const a=`Assen|Drenthe|info@assen.nl
De Wolden|Drenthe|gemeente@dewolden.nl
Hoogeveen|Drenthe|info@hoogeveen.nl
Midden-Drenthe|Drenthe|gemeente@middendrenthe.nl
Tynaarlo|Drenthe|info@tynaarlo.nl
Lelystad|Flevoland|gemeente@lelystad.nl
De Fryske Marren|Friesland|info@defryskemarren.nl
Leeuwarden|Friesland|gemeente@leeuwarden.nl
Smallingerland|Friesland|gemeente@smallingerland.nl
Ede|Gelderland|info@ede.nl
Apeldoorn|Gelderland|gemeente@apeldoorn.nl
Scherpenzeel|Gelderland|informatiebeheer@scherpenzeel.nl
Tiel|Gelderland|gemeente@tiel.nl
Westervoort|Gelderland|gemeente@westervoort.nl
Winterswijk|Gelderland|gemeente@winterswijk.nl
Heerlen|Limburg|gemeente@heerlen.nl
Kerkrade|Limburg|gemeentehuis@kerkrade.nl
Maastricht|Limburg|post@maastricht.nl
Roermond|Limburg|mail@roermond.nl
Weert|Limburg|gemeente@weert.nl
Alphen-Chaam|Noord-Brabant|info@alphen-chaam.nl
Altena|Noord-Brabant|info@gemeentealtena.nl
Baarle-Nassau|Noord-Brabant|gemeente@baarle-nassau.nl
Best|Noord-Brabant|info@gemeentebest.nl
Boekel|Noord-Brabant|info@boekel.nl
Cranendonck|Noord-Brabant|info@cranendonck.nl
Eersel|Noord-Brabant|gemeente@eersel.nl
Eindhoven|Noord-Brabant|gemeente@eindhoven.nl
Gilze en Rijen|Noord-Brabant|info@gilzerijen.nl
Loon op Zand|Noord-Brabant|info@loonopzand.nl
Maashorst|Noord-Brabant|info@gemeentemaashorst.nl
Moerdijk|Noord-Brabant|info@moerdijk.nl
Nuenen c.a.|Noord-Brabant|gemeentehuis@nuenen.nl
Oirschot|Noord-Brabant|info@oirschot.nl
Reusel-De Mierden|Noord-Brabant|gemeente@reuseldemierden.nl
Roosendaal|Noord-Brabant|info@roosendaal.nl
Tilburg|Noord-Brabant|gemeente@tilburg.nl
Waalre|Noord-Brabant|gemeente@waalre.nl
Alkmaar|Noord-Holland|post@alkmaar.nl
Bergen NH|Noord-Holland|info@bergen-nh.nl
Castricum|Noord-Holland|info@castricum.nl
Diemen|Noord-Holland|info@diemen.nl
Haarlemmermeer|Noord-Holland|info@haarlemmermeer.nl
Heemskerk|Noord-Holland|post@heemskerk.nl
Heiloo|Noord-Holland|info@heiloo.nl
Hilversum|Noord-Holland|gemeente@hilversum.nl
Hollands Kroon|Noord-Holland|contact@hollandskroon.nl
Hoorn|Noord-Holland|gemeente@hoorn.nl
Huizen|Noord-Holland|gemeente@huizen.nl
Koggenland|Noord-Holland|info@koggenland.nl
Opmeer|Noord-Holland|gemeente@opmeer.nl
Ouder-Amstel|Noord-Holland|gemeente@ouder-amstel.nl
Uitgeest|Noord-Holland|info@uitgeest.nl
Uithoorn|Noord-Holland|gemeente@uithoorn.nl
Almelo|Overijssel|gemeente@almelo.nl
Dinkelland|Overijssel|info@dinkelland.nl
Hardenberg|Overijssel|gemeente@hardenberg.nl
Hengelo|Overijssel|gemeente@hengelo.nl
Tubbergen|Overijssel|gemeente@tubbergen.nl
Zwolle|Overijssel|postbus@zwolle.nl
Amersfoort|Utrecht|info@amersfoort.nl
De Bilt|Utrecht|info@debilt.nl
Eemnes|Utrecht|info@eemnes.nl
Utrecht|Utrecht|gemeente@utrecht.nl
Vijfheerenlanden|Utrecht|info@vijfheerenlanden.nl
Woudenberg|Utrecht|info@woudenberg.nl
Terneuzen|Zeeland|gemeente@terneuzen.nl
Alblasserdam|Zuid-Holland|gemeente@alblasserdam.nl
Krimpenerwaard|Zuid-Holland|info@krimpenerwaard.nl
Nissewaard|Zuid-Holland|gemeente@nissewaard.nl
Noordwijk|Zuid-Holland|gemeente@noordwijk.nl
Ridderkerk|Zuid-Holland|info@ridderkerk.nl
Waddinxveen|Zuid-Holland|gemeente@waddinxveen.nl
Westland|Zuid-Holland|info@gemeentewestland.nl`,t=a.trim().split(`
`).map((e,n)=>{const[r,l,o]=e.split("|");return{id:"algemeen-aanvullend-"+(n+1),province:l,municipality:r,email:o,type:"Algemeen gemeenteadres",team:"Gemeente (centrale inbox)",person:"",role:"Algemeen gemeentelijk contact",field:"Algemeen",source:"https://organisaties.overheid.nl/export/Gemeenten.csv",published:"Eerdere inventarisatie (4 november 2026)",verified:"Overgenomen uit eerdere inventarisatie; actuele bereikbaarheid niet opnieuw bevestigd",reliability:"Overheidsregister (eerdere inventarisatie)",note:"Algemeen gemeenteadres, geen direct BOA- of THOR-contact. Vraag om doorsturen naar teamleider Handhaving.",research:"Algemeen terugvaladres",priority:"P3 – via gemeente",preferred:!0,imported:!1,origin:"Landelijke inventarisatie november 2026",updatedAt:"2026-11-04"}});export{t as AANVULLENDE_ALGEMENE_ADRESSEN};
