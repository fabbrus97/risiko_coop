
const cards = {
    "continents": {
        "europe": {"countries": ["islanda", "gran_bretagna", "europa_occ", 
                        "scandinavia", "europa_sett", "europa_mer", "ucraina"], 
                    "bonus": 5},
        "america_n": {"countries": ["alaska", "territori_n_o", "groenlandia", "alberta", "ontario",
                            "quebec", "stati_uniti_occidentali", "stati_uniti_orientali", "america_centrale"], 
                      "bonus": 5},
        "america_s": {"countries": ["venezuela", "brasile", "peru", "argentina"], 
                      "bonus": 2},
        "oceania": {"countries": ["indonesia", "nuova_guinea", "australia_occ", "australia_or"], 
                    "bonus": 2},
        "africa": {"countries": ["africa_n", "egitto", "congo", "africa_o", "africa_s", "madagascar"], 
                    "bonus": 3},
        "asia": {"countries": ["urali", "afghanistan", "medio_or", "siberia", "giappone", "jacuzia", "kamchatka", 
                      "cita", "mongolia", "cina", "india", "siam"], 
                "bonus": 7}
    },
    "countries": [
        {"nome":"alaska", "tipo":"fante", "image": "Alaska.jpg"}, {"nome": "territori_n_o", "tipo":"cannone", "image": "Territori del Nord Ovest.jpg"}, {"nome": "groenlandia", "tipo":"cavallo", "image": "Groenlandia.jpg"}, 
        {"nome": "alberta", "tipo":"fante", "image": "Alberta.jpg"}, {"nome": "ontario", "tipo":"cavallo", "image": "Ontario.jpg"}, {"nome": "quebec", "tipo":"cannone", "image": "Quebec.jpg"}, 
        {"nome": "stati_uniti_occidentali", "tipo":"fante", "image": "Stati Uniti Occidentali.jpg"}, 
        {"nome": "stati_uniti_orientali", "tipo":"cannone", "image": "Stati Uniti Orientali.jpg"}, {"nome": "america_centrale", "tipo":"cavallo", "image": "America Centrale.jpg"}, {"nome": "islanda", "tipo":"fante", "image": "Islanda.jpg"}, 
        {"nome": "gran_bretagna", "tipo":"cavallo", "image": "Gran Bretagna.jpg"}, {"nome": "europa_occ", "tipo":"fante", "image": "Europa Occidentale.jpg"}, {"nome": "scandinavia", "tipo":"cannone", "image": "Scandinavia.jpg"}, 
        {"nome": "europa_sett", "tipo":"cavallo", "image": "Europa Settentrionale.jpg"}, 
        {"nome": "europa_mer", "tipo":"cavallo", "image": "Europa Meridionale.jpg"}, {"nome": "ucraina", "tipo":"cannone", "image": "Ucraina.jpg"}, {"nome": "urali", "tipo":"cavallo", "image": "Urali.jpg"}, 
        {"nome": "afghanistan", "tipo":"fante", "image": "Afghanistan.jpg"}, {"nome": "medio_or", "tipo":"cannone", "image": "Medio Oriente.jpg"}, {"nome": "siberia", "tipo":"cannone", "image": "Siberia.jpg"}, 
        {"nome": "giappone", "tipo":"fante", "image": "Giappone.jpg"}, {"nome": "jacuzia", "tipo":"cavallo", "image": "Jacuzia.jpg"}, {"nome": "kamchatka", "tipo":"cavallo", "image": "Kamchatka.jpg"}, 
        {"nome": "cita", "tipo":"fante", "image": "Cita.jpg"}, {"nome": "mongolia", "tipo":"cannone", "image": "Mongolia.jpg"}, {"nome": "cina", "tipo":"cavallo", "image": "Cina.jpg"}, 
        {"nome": "india", "tipo":"fante", "image": "India.jpg"}, {"nome": "siam", "tipo":"cannone", "image": "Siam.jpg"}, {"nome": "venezuela", "tipo":"cannone", "image": "Venezuela.jpg"}, 
        {"nome": "brasile", "tipo":"cannone", "image": "Brasile.jpg"}, {"nome": "peru", "tipo":"cavallo", "image": "Peru.jpg"}, {"nome": "argentina", "tipo":"fante", "image": "Argentina.jpg"}, 
        {"nome": "africa_n", "tipo":"fante", "image": "Africa del Nord.jpg"}, 
        {"nome": "egitto", "tipo":"fante", "image": "Egitto.jpg"}, {"nome": "congo", "tipo":"cavallo", "image": "Congo.jpg"}, {"nome": "africa_o", "tipo":"cannone", "image": "Africa Orientale.jpg"}, 
        {"nome": "africa_s", "tipo":"cannone", "image": "Africa del Sud.jpg"}, {"nome": "madagascar", "tipo":"fante", "image": "Madagascar.jpg"}, {"nome": "indonesia", "tipo":"cavallo", "image": "Indonesia.jpg"}, 
        {"nome": "nuova_guinea", "tipo":"cavallo", "image": "Nuova Guinea.jpg"}, {"nome": "australia_occ", "tipo":"cannone", "image": "Australia Occidentale.jpg"}, 
        {"nome": "australia_or", "tipo":"fante", "image": "Australia Orientale.jpg"}, {"nome": "bonus", "tipo": "bonus", "image": "Jolly1.jpg"}, {"nome": "bonus", "tipo": "bonus", "image": "Jolly1.jpg"}],
    //se il campo kill è definito, l'obbiettivo conquer è sempre "conquista 24 territori" (se il giocatore è ucciso o non presente)
    //se il campo conquer è true, bisogna conquistare un terzo continente a scelta
    //se nulla è definito, bisogna conquistare 24 territori
    "objectives": [ 
        {"kill": "green", "conquer": {"countries": [], "extra": null}, "image": "kill_green.jpg"},
        {"kill": "yellow", "conquer": {"countries": [], "extra": null}, "image": "kill_yellow.jpg"},
        {"kill": "red", "conquer": {"countries": [], "extra": null}, "image": "kill_red.jpg"},
        //conquista europa e oceania e un terzo continente a scelta
        {"kill": "", "conquer": {"countries": [9, 10, 11, 12, 13, 14, 15, 38, 39, 40, 41], "extra": true}, "image": "conquer_Europa_Oceania.jpg"},
        //conquista asia e sud america
        {"kill": "", "conquer": {"countries": [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31], "extra": false}, "image": "conquer_Asia_SudAmerica.jpg"},
        //conquista nord america e africa
        {"kill": "", "conquer": {"countries": [0, 1, 2, 3, 4, 5, 6, 7, 8, 32, 33, 34, 35, 36, 37], "extra": false}, "image": "conquer_NordAmerica_Africa.jpg"},
        //conquista 24 territori a scelta
        {"kill": "", "conquer": {"countries": [], "extra": null}, "image": "conquer24.jpg"}
    ]
}

const adjacency = {
	"alaska": ["kamchatka", "territori_n_o", "alberta"],
	"alberta": ["alaska", "territori_n_o", "ontario", "stati_uniti_occidentali"],
	"america_centrale": ["venezuela", "stati_uniti_orientali", "stati_uniti_occidentali"],
	"stati_uniti_orientali": ["america_centrale", "stati_uniti_occidentali", "ontario", "quebec"],
	"groenlandia": ["territori_n_o", "ontario", "quebec", "islanda"],
	"territori_n_o": ["alaska", "alberta", "ontario", "groenlandia"],
	"ontario": ["alberta", "stati_uniti_occidentali", "territori_n_o", "stati_uniti_orientali", "quebec", "groenlandia"],
	"quebec": ["ontario", "stati_uniti_orientali", "groenlandia"],
	"stati_uniti_occidentali": ["alberta", "ontario", "stati_uniti_orientali", "america_centrale"],
	"argentina": ["peru", "brasile"],
	"brasile": ["argentina", "peru", "venezuela", "africa_n"],
	"peru": ["argentina", "brasile", "venezuela"],
	"venezuela": ["brasile", "peru", "america_centrale"],
	"gran_bretagna": ["islanda", "scandinavia", "europa_sett", "europa_occ"],
	"islanda": ["groenlandia", "gran_bretagna", "scandinavia"],
	"europa_sett": ["scandinavia", "gran_bretagna", "europa_occ", "europa_mer", "ucraina"],
	"scandinavia": ["islanda", "gran_bretagna", "europa_sett", "ucraina"],
	"europa_mer": ["europa_occ", "europa_sett", "ucraina", "medio_or", "africa_n", "egitto"],
	"ucraina": ["scandinavia", "europa_sett", "europa_mer", "medio_or", "afghanistan", "urali"],
	"europa_occ": ["gran_bretagna", "europa_sett", "europa_mer", "africa_n"],
	"congo": ["africa_n", "africa_o", "africa_s"],
	"africa_o": ["egitto", "africa_n", "congo", "africa_s", "madagascar", "medio_or"],
	"egitto": ["europa_mer", "africa_n", "africa_o", "medio_or"],
	"madagascar": ["africa_o", "africa_s"],
	"africa_n": ["europa_occ", "europa_mer", "brasile", "egitto", "congo", "africa_o"],
	"africa_s": ["madagascar", "africa_o", "congo"],
	"afghanistan": ["ucraina", "urali", "cina", "medio_or", "india"],
	"cina": ["mongolia", "siberia", "urali", "afghanistan", "india", "siam"],
	"india": ["siam", "medio_or", "cina", "afghanistan"],
	"cita": ["mongolia", "siberia", "jacuzia", "kamchatka"],
	"giappone": ["kamchatka", "mongolia"],
	"kamchatka": ["alaska", "jacuzia", "cita", "mongolia", "giappone"],
	"medio_or": ["europa_mer", "egitto", "india", "afghanistan", "ucraina", "africa_o"],
	"mongolia": ["cina", "siberia", "cita", "kamchatka", "giappone"],
	"siam": ["cina", "india", "indonesia"],
	"siberia": ["jacuzia", "cita", "mongolia", "cina", "urali"],
	"urali": ["siberia", "cina", "afghanistan", "ucraina"],
	"jacuzia": ["kamchatka", "cita", "siberia"],
	"australia_or": ["australia_occ", "nuova_guinea"],
	"indonesia": ["siam", "nuova_guinea", "australia_occ"],
	"nuova_guinea": ["indonesia", "australia_occ", "australia_or"],
	"australia_occ": ["australia_or", "nuova_guinea", "indonesia"]
}

class Player {
    /**
     * 
     * @param {int} turno 
     * @param {string} color 
     * @param {int} tanks 
     * @param {boolean} enemy 
     */
    constructor  (turno, color, tanks, enemy){
        this.turno  = turno;
        this.color = color;
        this.tanks = tanks;
        this.enemy = enemy;
        this.missing = false; //se true, il giocatore è disconnesso

        this.ready = false; // bool che indica se il giocatore ha già disposto le truppe nel turno 0
        this.killed = false; // se true, il giocatore è stato ucciso
        this.killedby = "" //il colore del giocatore che ha ucciso questo player

        this.countries = {}
        this.ps = new PrivateState();

        this.combo_tanks = 0 //contatore dei carri dati da una combo

        this.attacking = true; //booleano per indicare che ho iniziato un attacco - serve se un giocatore si disconnette

    }

    setCountries( countries ){ //gli stati che ha un giocatore e il numero di carri
        //es. {"cina": 1, "madagascar": 3}
        this.countries = countries
    }

    getColor(){
        return this.color
    }

    addCountry( country){
        this.countries[country] = 1
        this.tanks -= 1
    }

    /**
     * 
     * @param {string} country 
     * @param {int} tanks 
     */
     addTanks(country, tanks){ //numero dei carri armati in una zona
        this.countries[country] += tanks
        this.tanks -= tanks
    }

    /**
     * 
     * @param {string} country 
     * @param {int} tanks 
     */
    removeTanks(country, tanks, increaseCounter){
        //this.tanks sono i carri che possiamo posizionare 
        //dovrebbe essere positivo solo a inizio turno se abbiamo 
        //abbastanza territori/combo

        //se togliamo carri, potrebbe essere perché li abbiamo persi o stiamo facendo uno spostamento
        //nel primo caso li togliamo dal territorio e basta
        //nel secondo dobbiamo anche aumentare this.tanks
        
        //oppure li stiamo posizionando e in quel caso this.tanks va aumentato (magari abbiamo cambiato
        //idea sul numero di carri armati in una regione)
        this.countries[country] -= tanks
        if (increaseCounter)
            this.tanks += tanks
        
        if (this.countries[country] <= 0){
            //remove country
            delete this.countries[country]
        }

        
        this.killed = Object.keys(this.countries).length == 0
        
    }

    getTanks(){
        return this.tanks
    }
    
    start_playing(_cards){
        
        console.log("DEBUG inizio a giocare")

        //tutti hanno pescato un obiettivo, è di nuovo il mio turno
        // si può cominciare a distribuire i territori
        console.log("Il mio obiettivo è ")
        console.log(this.ps.getObjective())

        if (this.turno == 1 && this.ps.getObjective() != null){
            console.log("Tutti hanno un obiettivo, iniziamo a pescare gli stati")
            //questa funzione pesca una carta e dice agli altri giocatori di pescare
            this.set_countries(structuredClone(cards.countries))
            return;
        }

        //se sono il giocatore 1, cards è null perché sono io il mazziere
        //ovvero prendo le carte, pesco un obiettivo e passo
        if (this.turno != 1 && _cards == null){
            console.log("Attendo il giocatore 1...")
            return
        }

        //se sono il giocatore > 1 mi vengono passate le carte rimanenti
        //quindi pesco e passo
        let available_cards_obj = {};
        if (_cards == null){
            available_cards_obj = structuredClone(cards.objectives)
            console.log("GIOCATORE 1 sto per pescare obiettivo da tutte le carte obiettivo:")
            let c = this.draw_card(available_cards_obj)
            this.ps.setObjective(c)
            console.log("Ho pescato e settato l'obiettivo")
            console.log(c)
            // draw_interface() //non posso disegnare l'obiettivo prima di scegliere il colore
            
        } else {
            console.log("GIOCATORE > 1 sto per pescare obiettivo")
            
            let c = this.draw_card(_cards)
            this.ps.setObjective(c)
            console.log("Ho pescato e settato l'obiettivo")
            console.log(c)
            available_cards_obj = _cards
            // console.log("Carte rimanenti: ")
            // console.log(available_cards_obj)
            
        }

        //NOTA: ora devo dire agli altri giocatori che possono continuare, e fornirgli la lista delle carte obiettivo
        //rimanenti
        //la funzione setColor manderà agli altri giocatori un messaggio per avvisarli che possono continuare a giocare
        // con le carte rimanenti
        window.gs.obj_cards = available_cards_obj

        // seleziono un colore
        pickColor()
        
    }

    draw_card(_cards){
        let draw_id = parseInt(Math.random()*100%_cards.length)
        let card = _cards[draw_id]
        console.log("Lunghezza delle carte: " + cards.countries.length)
        _cards.splice(draw_id, 1)
        console.log("Ho eliminato una carta; lunghezza delle carte: " + cards.countries.length)
        return card;
    }
    
    set_countries(_cards){
        console.log("DEBUG Ho pescato una carta, sono il giocatore " + this.turno)
        let card = this.draw_card(_cards)
        while (card.nome == "bonus" && _cards.length > 0)
            card = this.draw_card(_cards)

        if (card.nome != "bonus"){ 
            //devo mettere questo controllo perché c'è la possibilità che l'ultima carta del mazzo 
            //sia un bonus e io l'abbia pescata
            this.addCountry(card.nome)    
        }
        let message = {};
        if (_cards.length > 0){
            message = {"command": "draw_country", "cards": _cards, "turno": this.turno}
            
        } else {
            console.log("DEBUG carte finite, disporre le truppe")
            message = {"command": "start_putting_tanks"}
            // window.comm.sendMessage(message)
            start_putting_tanks(Object.keys(this.countries));
            $("#unclosableModal").modal("hide")
        }

        window.comm.sendMessage(message)
    }

    start_turn(){
        //segnalino per sapere se nel turno abbiamo fatto una conquista o meno
        this.ps.conquer = false
        //assegna carri armati di base
        let t = parseInt(Object.keys(this.countries).length/3)
        //controlliamo se tra le nazioni c'è un continente
        console.log("Il giocatore di base deve avere " + t + " armate")
        t += this.checkContinents();
        this.tanks += t
        window.gs.initial_tank_counter = t

        draw_interface(true) //se posso mettere delle armate, disegnamo i + e -

        //controlla se ci sono combo
        if (this.checkCombo()){
            askUserCombo(); 
        }

        
        
    }

    checkContinents(){
        let hasEu = true
        for (let i in cards.continents["europe"].countries) {
            let card = cards.continents["europe"].countries[i]
            if (!this.countries[card]){
                hasEu = false;
                break
            }
        }

        let hasAm_n = true
        for (let i in cards.continents["america_n"].countries) {
            let card = cards.continents["america_n"].countries[i]
            if (!this.countries[card]){
                hasAm_n = false;
                break
            }
        }

        let hasAm_s = true
        for (let i in cards.continents["america_s"].countries) {
            let card = cards.continents["america_s"].countries[i]
            if (!this.countries[card]){
                hasAm_s = false;
                break
            }
        }

        let hasOc = true
        for (let i in cards.continents["oceania"].countries) {
            let card = cards.continents["oceania"].countries[i]
            if (!this.countries[card]){
                hasOc = false;
                break
            }
        }

        let hasAs = true
        for (let i in cards.continents["asia"].countries) {
            let card = cards.continents["asia"].countries[i]
            if (!this.countries[card]){
                hasAs = false;
                break
            }
        }

        let hasAf = true
        for (let i in cards.continents["africa"].countries) {
            let card = cards.continents["africa"].countries[i]
            if (!this.countries[card]){
                hasAf = false;
                break
            }
        }

        let t = 0;
        
        if (hasEu)
            t += cards.continents["europe"].bonus

        if (hasAm_n)
            t += cards.continents["america_n"].bonus


        if (hasAm_s)
            t += cards.continents["america_s"].bonus
            

        if (hasAs)
            t += cards.continents["asia"].bonus
        

        if (hasOc)
            t += cards.continents["oceania"].bonus
        

        if (hasAf)
            t += cards.continents["africa"].bonus
        
        console.log("Il giocatore ha un continente? Africa " + hasAf + " Asia " + hasAs + " Oceania " + hasOc + " AmN " + hasAm_n + " AmS " + hasAm_s + " europa " + hasEu)
        console.log("Riceve " + t + " armate extra")
        return t;

    }

    checkContinent(continent){
        switch (continent){
            case "europe":
        
                for (let i in cards.continents["europe"].countries) {
                    let card = cards.continents["europe"].countries[i]
                    if (!this.countries[card]){
                        return false;
                    }
                }
                break;
            case "america_n":
                for (let i in cards.continents["america_n"].countries) {
                    let card = cards.continents["america_n"].countries[i]
                    if (!this.countries[card]){
                        return false;
                    }
                }
                break;
            case "america_s":
                for (let i in cards.continents["america_s"].countries) {
                    let card = cards.continents["america_s"].countries[i]
                    if (!this.countries[card]){
                        return false;
                    }
                }
                break;

            case "oceania":

                let hasOc = true
                for (let i in cards.continents["oceania"].countries) {
                    let card = cards.continents["oceania"].countries[i]
                    if (!this.countries[card]){
                        return false;

                    }
                }
                break;

            case "asia":

                let hasAs = true
                for (let i in cards.continents["asia"].countries) {
                    let card = cards.continents["asia"].countries[i]
                    if (!this.countries[card]){
                        return false;

                    }
                }
                break;

            case "africa":
                for (let i in cards.continents["africa"].countries) {
                    let card = cards.continents["africa"].countries[i]
                    if (!this.countries[card]){
                        return false;
                    }
                }
                break;
            default:
                break;
        }
        return true;

    }

    checkCombo(){
        //questa funzione controlla se ho una combo tra le mie carte
        let cav = 0
        let fan = 0
        let can = 0
        let b = 0

        this.ps.cards.forEach(card => {
            switch (card.tipo){
                case "fante":
                    fan += 1
                    break;
                case "cavallo":
                    cav += 1
                    break;
                case "cannone":
                    can += 1
                    break;
                case "bonus":
                    b += 1
                    break;
                default:
                    break;
            }
        })

        let b1 = can >= 3; // 4 armate
        let b2 = fan >= 3; // 6 armate
        let b3 = cav >= 3; // 8 armate
        let b4 = can >= 1 && fan >= 1 && cav >= 1; // 10 armate
        let b5 = b >= 1 && (cav >= 2 || can >= 2 || fan >= 2); // 12 armate
        console.log("Il giocatore ha " + can + " cannoni" )
        console.log("Il giocatore ha " + fan + " fanti" )
        console.log("Il giocatore ha " + cav + " cavalli" )
        console.log("Il giocatore ha " + b + " bonus" )

        console.log(b1 + " " + b2 + " " + b3 + " " + b4 + " " + b5)

        return b1 || b2 || b3 || b4 || b5;
    }

    checkWin(){
        let win = false;
        if (this.ps.getObjective().kill){
            //devo uccidere qualcuno...
            // let enemy = this.ps.getObjective().kill;
            let enemy = window.gs.players.find(p => p.color == this.ps.getObjective().kill && p.color != this.color)
            //se il nemico esiste vinco se non ha più territori
            if (enemy){
                //Supp. io devo ucciedere i verdi; se i verdi non hanno territori allora vinco
                //MA vuol dire che se un altro giocatore fa l'ultima uccisione vinco io, cosa che deve succedere
                //solo se IO ho fatto l'ultima uccisione
                //quindi bisogna anche controllare chi ha ucciso il giocatore:
                win = enemy.killed && enemy.killedby == this.color
                if (!win && enemy.killed){
                    //il nemico è morto, ma non ho vinto: qualcun'altro lo ha ucciso
                    win = Object.keys(this.countries).length >= 24

                }
            } else { 
                //se il nemico non esiste/sono io vinco se ho >= 24 territori
                win = Object.keys(this.countries).length >= 24
            }
        } else {
            if (this.ps.getObjective().conquer.extra === false){
                //devo controllare di avere tutte le nazioni della lista 
                win = true;
                this.ps.getObjective().conquer.countries.forEach( index => {
                    let country2check = cards.countries[index].nome
                    if (!this.countries[country2check])
                        win = false
                })
            } else if (this.ps.getObjective().conquer.extra == null){

                //devo conquistare 24 territori a scelta
                if (Object.keys(this.countries).length >= 24)
                    win = true //ho vinto!
            } else {
                //devo conquistare europa, oceania e un terzo continente a scelta
                win = this.checkContinent("europe") && this.checkContinent("oceania") && (this.checkContinent("america_s") || this.checkContinent("america_n") || this.checkContinent("africa") || this.checkContinent("asia"))
            }
        }

        return win
    }
}

class GlobalState{
    /*
        controllo dello stato: un giocatore dichiara cosa sta per fare, in modo che ognuno
        possa verificare la legittimità della mossa, e infine invia lo stato modificato
        in modo che ognuno possa verificare che abbia effettivamente fatto quanto dichiarato
    */

    constructor(player) {
        //player sono io
        this.players = []
        this.players.push(player)

        this.attack_dices = []
        this.available_cards = structuredClone(cards.countries)
        this.turn = 0 //turno globale
        this.colors = ["red", "purple", "lightsalmon", "yellow", "green", "cornflowerblue"] //colori disponibili
        this.obj_cards = []
        this.initial_tank_counter = 0 //quanti carri ha a disposizione il giocatore all'inizio del proprio turno
        //questa variabile serve perché se posiziono e.g. 2 carri a inizio turno su un territorio che ha già 5 carri
        //portandolo in totale a 7, ma cambio idea, al massimo potrò rimuovere i 2 carri appena aggiunti e non anche i 
        //4 toglibili precedentemente posizionati
        this.player_turn = 0 //giocatore corrente

        this.final_phase = false; // fase di movimento armate prima di passare il turno
    }

    me(){
        return this.players[0]
    }
    
    /*
    come può cambiare lo stato?
        1. un giocatore posiziona i carri armati che riceve a inizio turno
         => controllare che il numero di stati gli consenta di farlo
        2. un giocatore posiziona carri armati per una combo
         => controlla che la combo dia quel numero di carri armati
         => controlla di non avere una carta della combo
        3. attacco:
         => un giocatore toglie carri armati ad un altro giocatore
         => conquista un nuovo territorio e ci sposta dei carri armati
    */ 
    
    /**
     * funzione per controllare che un avversario non stia barando
        controlliamo che abbia fatto un solo spostamento e in tutti gli altri 
        territori ci sia il giusto numero di carri
     */
    checkState(newState){
        let player = this.players.find(p => p.turno == newState.turno)
        
        //il giocatore sta provando a cambiare il proprio turno?
        if (player.turno != newState.turno){
            console.log("CHEATER: Il giocatore aveva detto di essere il " + player.turno + " e ora si dichiara il " + newState.turno)
            return false;
        }
        
        let move_country_from = ""
        let move_country_to = ""
        for (c in newState.countries){
            if (!player.countries[c]){ //il giocatore si è aggiunto uno stato senza averlo conquistato
                console.log("CHEATER: Il giocatore si è aggiunto lo stato " + c + " che prima non aveva")
                return false;
            }

            if (newState.tanks[c] < player.countries[c]){
                if (move_country_from.length > 0){
                    console.log("CHEATER: Il giocatore ha provato a togliere carri da " + move_country_from + " E " + c + " (al massimo 1 è consentito)")
                    return false;
                }
                move_country_from = c
            }
            if (newState.tanks[c] > player.countries[c]){
                if (move_country_to.length > 0){
                    console.log("CHEATER: Il giocatore ha provato ad aggiungere carri da " + move_country_from + " E " + c + " (al massimo 1 è consentito)")
                    return false
                }
                move_country_to = c
            }
            
        }

        if (move_country_from){
            console.log("CONTROLLO CHEATER: ((player.countries[move_country_from] - newState.tanks[move_country_from]) == (newState.tanks[move_country_to] - player.countries[move_country_to])):")
            console.log(player.countries[move_country_from] + " - " + newState.tanks[move_country_from] + " == " + newState.tanks[move_country_to] + " - " + player.countries[move_country_to])    
            return ((player.countries[move_country_from] - newState.tanks[move_country_from]) == (newState.tanks[move_country_to] - player.countries[move_country_to]))
        }
        else 
            return true
            
    }

    //funzione per controllare che un avversario non stia barando
    checkCard(card, objective){
        console.log("Devo controllare una carta (obiettivo: " + objective + ")")
        if (objective){ //controlliamo una carta obiettivo
            if (window.gs.me().ps.getObjective() == card)
                return false; //l'avversario bara, ha il mio stesso obiettivo
        } else {
            console.log("Le carte che devo controllare sono:")
            console.log(card)
            console.log("Le MIE carte sono:")
            console.log(window.gs.me().ps.cards)

            //In questo caso "card" è in realtà una lista di carte
            for (let i in card){
                if ( window.gs.me().ps.cards.find( c => c.nome == card[i].nome ))
                    return false;
            }
        }

        return true
    }

    //funzione per controllare che un avversario non stia barando
    //es. se ha 4 territori e mette 2 armate anziché 1, sta barando
    /**
     * 
     * @param {int} player_turn //turno del giocatore che ha posizionato i carri
     * @param {int} tanks  //numero di carri posizionati
     */
    checkTanks(player_turn, tanks){ 
        console.log("Controllo i carri del giocatore " + player_turn + " che ha usato " + tanks)
        var player = this.players.find(p => p.turno == player_turn)
        //nota: i carri che ha effettivamente un giocatore sono quelli dati dai territori/3
        // + eventualmente bonus continenti
        // + eventuali carri disponibili - variabile che viene inizializzata se il giocatore usa una combo
        console.log("I territori del giocatore sono:")
        console.log(player.countries)
        let available_tanks = parseInt(Object.keys(player.countries).length/3) + player.checkContinents() + player.combo_tanks
        console.log("I carri che il giocatore ha a disposizione sono " + available_tanks)
        player.combo_tanks = 0
        return available_tanks == tanks
    }

    checkDices(defense){

        for (let p in this.players){
            let player = this.players[p]

            if (player.countries[defense.attaking]){
                //controlliamo che i valori dei dadi siano legali
                for (let v in this.attack_dices){
                    let dice = this.attack_dices[v]
                    if (dice > 6)
                        return player.turno
                }

                //ho trovato lo stato del giocatore attaccante
                if (!(player.countries[defense.attacking] > this.attack_dices.lengths)){
                    //se l'attacco NON ha tante armate quante usate nell'attacco + 1 sta barando
                    return player.turno
                }
            }
            //simmetrico per la difesa
            if (player.countries[defense.attaked]){
                for (let v in defense.values){
                    let dice = defense.values[v]
                    if (dice > 6)
                        return player.turno
                }

                if (!(player.countries[defense.attacked] >defense.values)){
                    return player.turno
                }
            }
            
        }

        return ""
    }

    setColor(){
        
        let unknown_player = false
        window.gs.players.forEach( p =>{
            if (Object.keys(p.color).length == 0){ //c'è un giocatore di cui non so gli stati
                console.log("NON so il colore di " + p.color)
                unknown_player = true
            }
        })
        if (unknown_player)
            wait_players_modal(players_in_lobby)
        
        let color = this.me().color
        console.log("DEVO ELIMINARE IL COLORE " + color)
        let colorIndex = window.gs.colors.findIndex(c => c == color)
        if (colorIndex < 0)
            return
        window.gs.colors.splice(colorIndex, 1)

        //salvo il colore nel localStorage
        let lobby = JSON.parse(localStorage.getItem(lobby_name))
        console.log("Salvo il colore dentro localStorage")
        lobby.ps.color = color
        console.log(lobby)
        localStorage.setItem(lobby_name, JSON.stringify(lobby))

        window.comm.sendMessage({"command": "player_color", "turno": this.me().turno, "color": color})
        

        console.log("Dico agli altri giocatori di giocare")
        window.comm.sendMessage({"command": "draw_obj", "cards": this.obj_cards, "turno": this.me().turno})
        draw_interface();
    }

    action(action){
        //ci sono alcune azioni "universali", per aggiornare lo stato globale
        //e altre che dipendono dal turno

        //se un giocatore è scollegato, player_length non cambia; questo significa che
        //anche se i giocatori ora sono 5 e non 6, il 5 dirà che ora è il turno del 6 anche se
        //sarebbe il turno di 1 
        let missing_players = 0
        this.players.forEach(p => {
            if (p.missing)
                missing_players += 1
        })
        let actual_players = this.players.length - missing_players 
        
        let nextPlayer = 0
        if (action.from || action.turno){
            try {
                let t = action.from ? action.from : action.turno
                console.log("Action: calcolo il prossimo giocatore a partire da " + t)
                console.log("I giocatori sono ")
                console.log(this.players)

                nextPlayer = (t % this.players.length) + 1
                console.log("NextPlayer è " + nextPlayer)
                while (this.players.find(p => p.turno == nextPlayer).missing){ 
                    console.log(nextPlayer + " è missing, vediamo chi c'è dopo")
                    nextPlayer = (nextPlayer%this.players.length) + 1
                    console.log("Dopo c'è " + nextPlayer)
                }
            } catch (exc){

            }
            
        }
        

        console.log("Ricevuta azione")
        console.log(action)

        if (action.command == "player_color"){
            console.log("Il giocatore " + action.turno + " è di colore " + action.color)
            let index = this.colors.findIndex( c => c == action.color)
            this.colors.splice(index, 1)
            this.players.forEach( p => {
                if (p.turno == action.turno)
                    p.color = action.color
            })
            return;
        }

        if (action.command == "next"){
            let player = this.players.find(p => p.turno == action.turno)

            if (this.turn != 0){

                //controlla stato/carri disponibili
                if (!this.checkState(action)){
                    this.end_game("Il giocatore " + action.turno + " sta barando (troppi spostamenti/aggiunta illegale di una nazione)")
                    return;
                }
                

                let old_tanks = 0
                Object.keys(player.countries).forEach( c => {
                    old_tanks += player.countries[c]
                })
                let new_tanks = 0
                Object.keys(action.tanks).forEach( c => {
                    new_tanks += action.tanks[c]
                })

                console.log("Controllo carri del nemico: old/new:" + old_tanks + " " + new_tanks)
                if (new_tanks-old_tanks > 0 && !this.checkTanks(action.turno, new_tanks-old_tanks)){
                    this.end_game("Il giocatore " + action.turno + " sta barando (ha posizionato troppi carri)")
                    return;
                }
            }

            let firstPlayer = 1
            while (this.players.find(p => p.turno == firstPlayer).missing)
                firstPlayer += 1
            if (this.me().turno != firstPlayer){
                //nelle fasi iniziali i giocatori potrebbero autonomamente 
                //settare il turno da 0 a 1; in ogni caso, se sono il giocatore 1, 
                //non devo mai settare il turno da un altro giocatore (perché sono
                //io che li cambio)
            
                this.turn = action.turn
            }

            

            player.setCountries(action.tanks)
           
            let unknown_player = false
            this.players.forEach( p =>{
                if (Object.keys(p.countries).length == 0 && !p.killed){ //c'è un giocatore di cui non so gli stati
                    console.log("NON SO I TUOI TERRITORI " + p.color)
                    unknown_player = true
                }
            })
                    
            if (!unknown_player && this.me().ready){
                if (this.turn == 0 && this.me().turno != 1){
                    console.log("Imposto il turno a 1!!! perché siamo nel turno globale 0 e io sono il giocatore " + this.me().turno)
                    //questo serve perché quando il giocatore 1 inizia a giocare non broadcasta il turno, 
                    //ma solo dopo aver giocato
                    this.turn = 1
                }
                draw_interface()
            }

            //nota: turn è il turno globale (numero di mani giocate, es. 13)
            //turno è il turno del giocatore (es. rosso è 1, verde è 2...)
            //player_turn è il giocatore che può giocare ora (es. ora è il turno di 2)
        }

        if (action.command == "attack"){
            //mostra i dadi - lo possono vedere tutti
            set_dices(action.values, true)
            //controlliamo se siamo sotto attacco
            let nation = action.attacked;
            this.attack_dices = action.values
        
            this.players.forEach(p => {
                //se deve difendere un giocatore che si è disconnesso, e io sono il giocatore
                //successivo a quello che attacca, tiro io al suo posto - se la nazione sotto 
                //attacco è mia o del giocatore mancante, altrimenti non devo far nulla
                if (p.countries[nation]){
                    //abbiamo trovato il giocatore con la nazione sotto attacco
                    if (p.turno == this.me().turno || (p.missing && this.me().turno == nextPlayer)){
                        this.prepare_defense(action, p.countries);
                    }
                }
                
            })
            
            return;
        } 

        if (action.command == "defense"){
            //mostra i dadi - lo possono vedere tutti
            set_dices(action.values, false)
            //vediamo qual è la nazione che risponde alla difesa
            //NOTA: questo serve sia alla nazione che ha fatto l'attacco, sia
            // a tutte le altre per aggiornare lo stato globale
            this.defend(action);
            return
        }

        if (action.command == "available_cards"){
            this.available_cards = action.cards
            return;
        }

        if (action.command == "combo"){
            //TODO grafica: mostra messaggio che action.player ha usato una combo
            let combo_tanks = this.me().ps.useCombo(action.combo_cards, action.player)
            if ( combo_tanks > 0 && this.checkCard(action.combo_cards, false)){
                this.players.find(p => p.turno == action.player).combo_tanks = combo_tanks
                
            } else {
                
                this.end_game("Il giocatore " + action.player + " sta barando usando una combo!")
            }
            return;
        }

        if (action.command == "start_putting_tanks"){
            console.log("Tutti hanno pescato, posso mettere i carri armati")
            
            start_putting_tanks(Object.keys(this.me().countries))
            $("#unclosableModal").modal("hide")
            return;
        }

        if (action.command == "steal_cards"){
            if (!(this.turn >= 4)){
                this.end_game("Il giocatore sta barando (non si possono rubare le carte prima del 4 turno")
                return
            }

            if (!(this.players.find(player => player.color == action.player).killedby == action.winner)){
                this.end_game("Il giocatore " + action.winner + " sta barando (Vuol rubare le carte ad un giocatore che non ha ucciso")
                return
            }

            if (action.player == this.me().color){
                window.comm.sendMessage({"command": "player_cards", "winner": action.winner, "cards": this.me().ps.cards})
                this.me().ps.cards = []
            }
            return;
        }

        if (action.command == "player_cards"){
            if (action.winner == this.me().color){
                action.cards.forEach( c => {
                    this.me().ps.addCard(c)
                })
            }
            return;
        }

        if (action.command == "update_status"){ 
            //viene chiamato quando un giocatore disponde dei carri prima della fase di attacco
            //è come una next che però non passa davvero il turno, fa solo aggiornare lo stato 
            //delle armate nemiche

            //giocatore che ha mandato il comando
            let player = this.players.find(p => p.turno == action.turno)

            //controlla stato/carri disponibili
            if (!this.checkState(action)){
                this.end_game("Il giocatore " + action.turno + " sta barando (troppi spostamenti/aggiunta illegale di una nazione)")
                return;
            }
            

            let old_tanks = 0
            Object.keys(player.countries).forEach( c => {
                old_tanks += player.countries[c]
            })
            let new_tanks = 0
            Object.keys(action.tanks).forEach( c => {
                new_tanks += action.tanks[c]
            })

            if (this.turn != 0 && new_tanks-old_tanks > 0 && !this.checkTanks(action.turno, new_tanks-old_tanks)){
                this.end_game("Il giocatore " + action.turno + " sta barando (ha posizionato troppi carri)")
                return;
            }

            player.setCountries(action.tanks)
            
            this.turn = action.turn //il giocatore 1 cambia il turno, così avvisa anche gli altri
            draw_interface()
            return
        }

        if (action.command == "status_report"){
            //Un giocatore che si era disconnesso chiede un recap; devo aggiornare:
            // - il mio turno personale
            // - il turno del giocatore che sta giocando ora nello stato globale
            // - se sono il giocatore successivo, gli mando lo stato globale attuale
            console.log("Ho ricevuto una richiesta di supporto da " + action.turno + " (il mio turno è " + this.me().turno + " e i giocatori attuali sono " + actual_players + ")")
            // this.players.forEach( p => {
            //     if (action.from.turno <= p.turno){
            //         p.turno += 1
            //     }
            // })

            // this.players.find(p => p.color == action.from.color).turno = action.from.turno
            
            // if (this.player_turn >= action.from.turno){
            //     this.player_turn += 1
            // }

            if (this.me().turno == nextPlayer){
                console.log("Mando lo stato globale (me tocca)")
                window.comm.sendMessage({"command": "status_report_answer", "gs": this.getStatus(), "to": action.turno})
            }
            return;
        }

        if (action.command == "status_report_answer"){
            if (action.to == this.me().turno){
                console.log("Ricevuto status_report! Ora posso tornare a giocare (quando sarà il mio turno)")
                this.setStatus(action.gs)
            }
            return;
        }

        if (action.command == "win"){
            console.log("Fine partita, un giocatore ha vinto")
            this.end_game("Fine partita, un giocatore ha vinto con l'obbiettivo: ", action.objective)
            
            return;
        }

        this.player_turn = this.turn == 0 ? 1 : nextPlayer

        if (nextPlayer != this.me().turno && !(action.command == "next" && this.turn == 0 && this.me().turno == 1)){
            console.log("Non è il mio turno: ha giocato " + action.turno + " e io sono " + this.me().turno)
            return
        }

        switch (action.command){
            case "draw_country":
                console.log("Il giocatore " + action.turno + " mi ha detto di pescare roba")
                this.me().set_countries(action.cards)
                break;
            case "draw_obj":
                console.log("Posso pescare un obiettivo")
                this.me().start_playing(action.cards);
                //this.players[0].draw_card(action.cards)
                
            break;
            case "next":
                //se il giocatore che ha passato è prima di me - quindi in teoria è il mio turno
                // ma siamo al turno globale 0, vuol dire che stiamo ancora sistemando la plancia
                //e devo aspettare che inizi il giocatore 1
                if (this.turn == 0 && this.me().turno != 1){
                    console.log("Tecnicamente è il mio turno, ma stiamo aspettando il giocatore 1 perché non abbiamo finito i preparativi")
                    break
                }
                let unknown_player = false
                this.players.forEach( p =>{
                    if (Object.keys(p.countries).length == 0 && !p.killed){ //c'è un giocatore di cui non so gli stati
                        console.log("NON SO I TUOI TERRITORI " + p.color)
                        unknown_player = true
                    }
                })
                    
                if (unknown_player)
                    break;
                
                //posso ricevere n-1 next e "ufficialmente" cominiciare il turno, ma siccome potrei non 
                //aver ancora posizionato i carri non faccio niente
                if (!this.me().ready)
                    break;

                console.log("Posso giocare perché tutti hanno mostrato i carri ed è il mio turno")
                
                let firstPlayer = 1
                while (this.players.find(p => p.turno == firstPlayer).missing)
                    firstPlayer += 1
                if (this.me().turno == firstPlayer)
                    this.turn += 1

                if (!this.me().killed)
                    this.me().start_turn();
                else 
                    window.comm.sendMessage({"command": "next", "tanks": this.me().countries, "turno": this.me().turno, "turn": this.turn})
                
                break;
            default:
                console.error("Unknown action")
            break;
        }
    }

    getStatus(){
        let _players = []
        this.players.forEach( p => {
            _players.push({
                "color": p.color, 
                "turno": p.turno,
                "countries": p.countries,
                "missing": p.missing,
                "killed": p.killed,
                "killedby": p.killedby,
                "combo_tanks": p.combo_tanks,
                "tanks": p.tanks,
                //non devo restituire lo stato privato    
            })
    
        })
        return {
            "player_turn"    : this.player_turn,
            "available_cards": this.available_cards,
            //non restituiamo gli obiettivi rimanenti disponibili
            "players": _players,
            "turn": this.turn
        }
    }

    setStatus(globalStatus){
        console.log("Setto lo stato globale")

        console.log("I giocatori per me sono ")
        this.players.forEach( p => {p.color + ": " + p.turno})

        this.player_turn = globalStatus.player_turn
        this.available_cards = globalStatus.available_cards
        this.turn = globalStatus.turn
        
        globalStatus.players.forEach( p=> {
            console.log(p.color + ": " + p.turno)

            
            let player = this.players.find( x => x.turno == p.turno)
            if (player){
                player.setCountries(p.countries)
                player.color = p.color
                player.missing = p.missing

                player.killed = p.killed
                player.killedyby = p.killedby

            } else {
                player = new Player(p.turno, p.color, 0, true)
                player.setCountries(p.countries)
                player.missing = p.missing

                player.killed = p.killed
                player.killedyby = p.killedby

                this.addPlayer(player)    
            }
        })

        console.log("Adesso i giocatori sono: ")
        this.players.forEach( p => {p.color + ": " + p.turno})
        
        draw_interface()
        $("#unclosableModal").modal("hide")
    }

    end_game(reason, obj){
        localStorage.removeItem(lobby_name)
        window.gs = undefined
        window.comm = undefined
        // alert("Partita terminata: " + reason)
        end_game_modal(reason, obj)
        
        socket.emit("deletelobby", lobby_name)
        
    }

    //funzione per passare il turno
    next(){
        this.me().ready = true; 

        // let missing_players = 0
        // this.players.forEach(p => {
        //     if (p.turno < 0)
        //         missing_players += 1
        // })
        // let actual_players = this.players.length - missing_players 
        
        console.log("GIOCATORE " + this.me().turno + ": passo il turno")


        this.player_turn = (this.me().turno % this.players.length) + 1
        while (this.players.find(p => p.turno == this.player_turn).missing)
            this.player_turn = (this.player_turn % this.players.length) + 1

        let unknown_player = false
        this.players.forEach( p =>{
            if (Object.keys(p.countries).length == 0){ //c'è un giocatore di cui non so gli stati
                console.log("NON SO I TUOI TERRITORI " + p.color)
                unknown_player = true
            }
        })
        if (unknown_player){
            console.log("DEBUG non conosco ancora degli stati")
        }
        if (!unknown_player && this.turn == 0){
            //Nota: normalmente la condizione "turno == 1" per cercare il primo giocatore è sbagliata
            //perché il giocatore 1 potrebbe essersi disconnesso, quindi il vero primo turno potrebbe essere
            // e.g. del giocatore 2; tuttavia questa condizione non vale nel turno 0, dove se un giocatore
            // si disconnette si annulla la partita
            // if (this.me().turno != 1){
                //questo serve perché quando il giocatore 1 inizia a giocare non broadcasta il turno, 
                //ma solo dopo aver giocato
                this.turn = 1
            // }
            console.log("Siccome siamo al turno 0 e conosco tutti i giocatori, 1 può iniziare")
            this.player_turn = 1 
            draw_interface()
        }

        if (this.player_turn == this.me().turno){
            console.log("Inizio il turno!")
            // this.turn += 1
            this.me().start_turn()
            window.comm.sendMessage({"command": "update_status", "tanks": this.me().countries, "turno": this.me().turno, "turn": this.turn})
        } else {
            //Nota: turno è quello del giocatore, turn è quante mani sono state giocate fin'ora
            window.comm.sendMessage({"command": "next", "tanks": this.me().countries, "turno": this.me().turno, "turn": this.turn})
        }

    }

    /**
     * 
     * @param {Player} player 
     */
    addPlayer(player){
        this.players.push(player)
    }

    prepare_defense(attack, _countries){
        
        //quanti carri abbiamo a disposizione?
        let nation = attack.attacked;
        let tanks = _countries[nation]

        //mostra messaggio "tizio sta attaccando con x carri"
        console.log("Attenzione! " + attack.attacking + " sta attaccando " + attack.attacked + "!")
        $("#text_status").html("<b>" + $(`#${attack.attacked}`).siblings(".territorio").text() + "</b> sotto attacco da <b>" + $(`#${attack.attacking}`).siblings(".territorio").text() + "</b>!")

        window.attacking_nation = attack.attacking
        window.attacked_nation  = attack.attacked
        enable_dices(false, tanks)
                
    }

    defend(defense){

        this.me().attacking = false

        console.log("DEBUG inizio difesa: adesso ho da disporre " + this.me().tanks + " armate")
        
        //controllo bari: controlliamo che i dadi di attacco e di difesa siano il numero giusto
        let cheater = this.checkDices(defense)
        if (cheater.length > 0){
            this.end_game("Durante l'attacco " + cheater + " ha barato tirando più dadi del dovuto")
            return
        }

        if (!adjacency[defense.attacking].find( country => country == defense.attacked)){
            this.end_game("Il giocatore sta barando (attacco da una nazione non confinante)!")
            return
        }


        //stabiliamo anzitutto chi ha vinto - ordiniamo al contrario
        this.attack_dices.sort((a, b) => b - a) // [6, 4, 2]
        defense.values.sort((a, b) => b - a)    // [6, 3]

        let attack_losses = 0
        let defense_losses = 0
        
        let a = 0;
        let d = 0;
        while(a < this.attack_dices.length && d < defense.values.length){
            if (this.attack_dices[a] > defense.values[d])
                defense_losses += 1
            else 
                attack_losses += 1
            
            a += 1; d += 1
        }

        console.log("L'attacco ha perso " + attack_losses)
        console.log("La difesa ha perso " + defense_losses)


        let countryLost = false
        let attackingPlayer = null;
        let attackedPlayer = null
        //stabiliamo quali sono le nazioni in gioco e aggiorniamo nel caso di conquista
        this.players.forEach( p => {
            if (p.countries[defense.attacking]){
                //caso facile: il giocatore ha il territorio attaccante
                console.log("Il giocatore " + p.color + " aveva il territorio " + defense.attacking + " con " + p.countries[defense.attacking] + " carri")
                p.removeTanks(defense.attacking, attack_losses, false)
                attackingPlayer = p
                console.log("Dopo le perdite di " + attack_losses + " ora ne ha " + p.countries[defense.attacking])

            }
            if (p.countries[defense.attacked]){
                //caso più difficile: c'è la possibilità che il giocatore abbia perso il territorio
                console.log("Il giocatore " + p.color + " aveva il territorio " + defense.attacked + " con " + p.countries[defense.attacked] + " carri")

                p.removeTanks(defense.attacked, defense_losses, false)
                attackedPlayer = p

                //controlliamo se il territorio è stato eliminato
                countryLost = !(p.countries[defense.attacked] > 0)

                if (countryLost){
                    console.log("Dopo le perdite di " + defense_losses + " ha perso il territorio")
                } else {
                    console.log("Dopo le perdite di " + defense_losses + " ora ne ha " + p.countries[defense.attacked])

                }
                
            }
        })

        if (countryLost){
            //spostamento dei carri per regolamento dopo conquista territorio
            attackingPlayer.removeTanks(defense.attacking, this.attack_dices.length, true)

            attackingPlayer.addCountry(defense.attacked)
            //sposto tanti carri quanti ne ho usati per l'attacco meno 1 perché "addCountry" aggiunge già un carro
            attackingPlayer.addTanks(defense.attacked, this.attack_dices.length - 1)    
            //inoltre, addCountry toglie un carro dalle armate disponibili, che va bene a inizio turno ma non in questo caso
            // attackingPlayer.tanks += 1

            console.log("Dopo la conquista del territorio, lo stato attaccante ora ha " + attackingPlayer.countries[defense.attacking] + " carri")
            console.log("Dopo la conquista del territorio, lo stato conquistato ora ha " + attackingPlayer.countries[defense.attacked] + " carri")


            //pesca carta - se è la prima conquista - e manda agli altri le carte rimanenti
            if (attackingPlayer == this.me() && !this.me().ps.conquer){
                this.me().ps.addCard(this.me().draw_card(this.available_cards))
                this.me().ps.conquer = true
                window.comm.sendMessage({"command": "available_cards", "cards": this.available_cards})
            }

            //controlla se ho ucciso l'avversario, perché nel caso deve darmi le sue carte - se non siamo arrivati al 4 turno
            if (attackedPlayer.killed && this.turn > 4){
                attackedPlayer.killedby = attackingPlayer.color
                
                window.comm.sendMessage({"command": "steal_cards", "player": attackedPlayer.color, "winner": attackingPlayer.color})
            }

            //devo aggiornare la grafica - stati e eventuali carte pescate
            draw_interface()
            if (attackingPlayer.turno == this.me().turno){
                $("#next-btn").prop("disabled", false)
                $("#move_btn").prop("disabled", false)

            }
            let status_country = this.me() == attackingPlayer ? "conquistato" : "perso"
            $("#text_status").html("L'attacco ha perso: <b>" + attack_losses + "</b> armate <br/> la difesa ha perso: <b>" + defense_losses + "</b> armate; territorio <b>" + status_country + "</b>!")

            //controlliamo se abbiamo vinto
            if (this.me().checkWin()){
                window.comm.sendMessage({"command": "win", "objective": this.me().ps.getObjective()})
                this.end_game("Hai vinto!")
            }

        } else {
            draw_interface()
            if (attackingPlayer.turno == this.me().turno){
                $("#next-btn").prop("disabled", false)
                $("#move_btn").prop("disabled", false)

            }
            $("#text_status").html("L'attacco ha perso: <b>" + attack_losses + "</b> armate <br/> la difesa ha perso: <b>" + defense_losses + "</b> armate")

        }

        console.log("DEBUG fine difesa: adesso ho da disporre " + this.me().tanks + " armate")

        //non devo mandare alcun messaggio a nessuno perché tutti avendo visto
        //le nazioni e i dadi possono calcolare autonomamente l'esito
        
        //se ero la nazione attaccante, è ancora il mio turno e posso tornare in fase di attacco
        if (attackingPlayer == this.me())
            attack_phase()

    }

}

class PrivateState{
    constructor(){
        this.cards = []
        this.conquer = false
    }

    addCard(card){
        
        this.cards.push(card)

        let data = JSON.parse(localStorage.getItem(lobby_name))
        
        data.ps.cards.push(card)

        localStorage.setItem(lobby_name, JSON.stringify(data))
    }

    /**
     * 
     * @param {string} card 
     */
    removeCard(card){        
        console.log("Lunghezza delle carte: " + cards.countries.length)
        this.cards.splice(this.cards.findIndex( e => e.nome == card), 1)
        console.log("Ho eliminato una carta; lunghezza delle carte: " + cards.countries.length)

        let data = JSON.parse(localStorage.getItem(lobby_name))
        
        data.ps.cards.splice(data.ps.cards.findIndex( c => c == card))
        console.log("Ho eliminato una carta; lunghezza delle carte: " + cards.countries.length)

        localStorage.setItem(lobby_name, JSON.stringify(data))
    }

    setObjective(obj){
        this.objective = obj

        let data = JSON.parse(localStorage.getItem(lobby_name))
        data.ps.obj = obj
        data.ps.cards = []
        localStorage.setItem(lobby_name, JSON.stringify(data))
    }

    getObjective(){
        return this.objective
    }

    //questa funzione può essere chiamata su di me oppure 
    //posso passare un parametro 'player' per verificare la 
    //validità della combo dichiarata da player
    useCombo(cards2use, player){
        //restituisce il numero di carri dati dalla combo
        //o 0 se non è valida
        let cav = 0
        let fan = 0
        let can = 0
        let bon = 0

        console.log("Carte da usare per la combo: ")
        console.log(cards2use)

        cards2use.forEach(card => {
            card = cards.countries.find(e => e.nome == card)
            switch (card.tipo){
                case "fante":
                    fan += 1
                    break;
                case "cavallo":
                    cav += 1
                    break;
                case "cannone":
                    can += 1
                    break;
                case "bonus":
                    bon += 1
                    break;
                default:
                    break;
            }
        })

        console.log("fan: "+ fan +" cav: "+ cav +" can: "+ can +" bonus:" + bon)

        let b = 0
        if (can == 3)
            b = 4;
        if (fan == 3)
            b = 6
        if (cav == 3)
            b = 8
        if (cav == 1 && fan == 1 && can == 1)
            b = 10
        if (bon == 1 && (cav == 2 || can == 2 || fan == 2))
            b = 12
        
        if (!player){
            if (b > 0){
                cards2use.forEach(card => {
                    if (window.gs.me().countries[card]){
                        b += 2
                        console.log("Che fortuna, ho " + card + ": 2 armate extra per la combo!")
                    }
                })
            
                // se è una combo, diamo i carriarmati corrispondenti e segnaliamolo agli altri giocatori, 
                // riaggiungiamo le carte al mazzo
                cards2use.forEach( c => {
                    this.removeCard(c)

                    window.gs.available_cards.push(cards.countries.find(e => e.nome == c))
                })

                window.gs.me().tanks += b

                console.log("C-C-Combo (forse)! Ottieni + " + b + " armate")

                window.comm.sendMessage({"command": "combo", "cards": window.gs.available_cards, "combo_cards": cards2use, "player": window.gs.me().turno})
                
            }
        } else {
            if (b > 0){
                cards2use.forEach(card => {
                    if (window.gs.players.find(p => p.turno == player).countries[card]){
                        b += 2
                    }
                })
            }
        }

        return b

    }

}

