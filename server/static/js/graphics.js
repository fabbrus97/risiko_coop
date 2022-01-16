function pickColor(){
    let colors = window.gs.colors
    
    let div_colors = ""
    //impostiamo il primo colore come quello dell'utente, così se il giocatore non fa una selezione
    // ne esiste una obbligata di default
    window.gs.me().color = colors[0]

    colors.forEach( color => {
        let span = ""
        if (color == colors[0])
            span = `<span class="color-selection" id="select-${color}" style=" display: inline-block; width: 65px; height: 40px; border: solid; background-color: ${color};" onclick="setColor('${color}')"></span>`
        else
            span = `<span class="color-selection" id="select-${color}" style=" display: inline-block; width: 65px; height: 40px; background-color: ${color}; " onclick="setColor('${color}')"></span>`
        div_colors += span
    })

    $("#exampleModalLabel").text("Seleziona il tuo colore!")
    $("#exampleModalBody").empty()
    $("#exampleModalBody").append(div_colors)

    $("#exampleModal").modal("show")
}

$("#exampleModal").on("hidden.bs.modal", e => { console.log("MODALE CHIUSO"); window.gs.setColor() });

function setColor(color){
    //Nota: c'è una funzione analoga in globalState
    //questa salva il valore temporaneo scelto dall'utente 
    //(es. l'utente potrebbe cliccare rosso e subito dopo verde)
    //l'altra è "definitiva" in quanto toglie il colore dalla lista
    //dei colori disponibili e annuncia agli altri giocatori la
    //nostra scelta
    window.gs.me().color = color

    Object.keys($(".color-selection")).forEach ( span => {
        $($(".color-selection")[span]).css("border", "0px")
    })

    var selected = $(`#select-${color}`)
    if (color == "black")
        selected.css("border", "solid white")
    else 
        selected.css("border", "solid")

}

function start_putting_tanks(nations){

    //disabilita dadi
    disable_dices(true)
    disable_dices(false)

    //disabilita bottoni
    Object.keys($("#dashboard button")).forEach(btn => { 
        try {
            $($("#dashboard button")[btn]).prop('disabled', true);
        } catch(exc) { /*do nothing*/ } 
    })

    nations.forEach( n => {

        console.log("DEPLOY THE TANKSSS!!!! in " + n )

        $(`#${n}`).css("fill", window.gs.me().color)
        $($(`#${n}`).siblings()[0]).text(window.gs.me().countries[n])
        let image_already_present = false;
        Object.keys($(`#${n}`).siblings()).forEach( e => {
            if ($($(`#${n}`).siblings()[e]).prop("tagName") == "image")
                image_already_present = true
        })

        if (!image_already_present){
            let x = parseInt($($(`#${n}`).siblings()[0]).attr("x"))
            let y = parseInt($($(`#${n}`).siblings()[0]).attr("y")) - 10

            var img = document.createElementNS('http://www.w3.org/2000/svg','image');
            img.setAttributeNS(null,'height','10px');
            img.setAttributeNS(null,'width','10px');
            img.setAttributeNS('http://www.w3.org/1999/xlink','href','../images/minus.png');
            img.setAttributeNS(null,'x', x + 21);
            img.setAttributeNS(null,'y', y);
            img.setAttributeNS(null, 'visibility', 'visible');
            $(img).click(e => remove_tank(e.target))
            $(img).addClass("disabled")

            $(`#${n}`).parent().append(img)

            img = document.createElementNS('http://www.w3.org/2000/svg','image');
            img.setAttributeNS(null,'height','10px');
            img.setAttributeNS(null,'width','10px');
            img.setAttributeNS('http://www.w3.org/1999/xlink','href','../images/plus.png');
            img.setAttributeNS(null,'x', x + 31);
            img.setAttributeNS(null,'y', y);
            img.setAttributeNS(null, 'visibility', 'visible');
            $(img).click(e => add_tank(e.target))
            $(`#${n}`).parent().append(img)
        }
    })

    alert("Puoi cominciare a disporre le armate!!!!")
}

function add_tank(element){

    // if (window.gs.me().getTanks() == 0){
    if ($(element).attr('class') == "disabled"){
        return;
    }

    let state = ""
    let n = 0
    let text = null;
    Object.keys($(element).siblings()).forEach( e => {
        
        e = $(element).siblings()[e]

        if ($(e).prop("tagName") == "path"){
            state = $(e).prop("id")
        }
        if ($(e).prop("tagName") == "text"){
            text = e;
            n = parseInt($(e).text())
        }
        if ($(e).prop("tagName") == "image"){
            $(e).removeClass("disabled")
        }
    })
    
    if (window.gs.me().getTanks() > 0){
        n += 1
        $(text).text(n)
        window.gs.me().addTanks(state, 1)
        updateTanksCounter(window.gs.me().getTanks())
    }
}

function remove_tank(element){

    if ($(element).attr('class') == "disabled"){
        return;
    }

    let state = ""
    let n = 0
    let text = null;
    Object.keys($(element).siblings()).forEach( e => {
        
        e = $(element).siblings()[e]
        if ($(e).prop("tagName") == "path"){
            state = $(e).prop("id")
        }
        if ($(e).prop("tagName") == "text"){
            text = e;
            n = parseInt($(e).text())
            if (n == 1)
                return;
        }
    })

    if (n>1){
        n -= 1
        $(text).text(n)
        window.gs.me().removeTanks(state, 1, true)
        updateTanksCounter(window.gs.me().getTanks())
        if (n == 1)
            $(element).addClass("disabled")
        
    }

}

function updateTanksCounter(n){
    
    $("#tank_counter_dashboard").text(n)
    if (n == 0){
        Object.keys($("image")).forEach( i => {
            try {
                if ($($("image")[i]).prop("href").baseVal.endsWith("plus.png")){
                    $($("image")[i]).addClass("disabled")
                }
            } catch(error) {
                // do nothing
            }
        })
        if (window.gs.player_turn == window.gs.me().turno && window.gs.turn != 0 ){ 
            //se il turno è 0, non posso abilitare i bottoni come farei normalmente
            //se la funzione è stata invocata da draw_interface - perché altri giocatori
            //hanno conquistato/perso territori -, non posso abilitare i bottoni come 
            //farei normalmente perché non è il mio turno
            $("#attack_phase_btn").prop("disabled", false)
            $("#next-btn").prop("disabled", false)
        } else if (window.gs.turn == 0){
            $("#next-btn").prop("disabled", false)
        }
        
            
    } 
    if (n >= 1){
        $("#attack_phase_btn").prop("disabled", true)

        Object.keys($("image")).forEach( i => {
            try {
                if ($($("image")[i]).prop("href").baseVal.endsWith("plus.png")){
                    $($("image")[i]).removeClass("disabled")
                }
            } catch(error) {
                // do nothing
            }
        })
        $("#attack_phase_btn").prop("disabled", true)
        $("#next-btn").prop("disabled", true)


    }
    if (window.gs.me().getTanks() == window.gs.initial_tank_counter && window.gs.turn != 0){ //non vale nel 'turno' di preparazione
        //se dopo che ho rimosso una armata il numero di carri torna ad essere 
        //quello che avevo inizialmente, allora non posso rimuovere altri carri
        // - perché starei facendo uno spostamento illegale di armate
        //quindi disabilito tutti i -
        Object.keys($("image")).forEach( i => {
            try {
                if ($($("image")[i]).prop("href").baseVal.endsWith("minus.png")){
                    $($("image")[i]).addClass("disabled")
                }
            } catch(error) {
                // do nothing
            }
        })
        //nota 1: non è necessario riabilitare i - quando la condizione non vale più
        //perché è già fatto da add_tank con il - interessato
        //nota 2: non è possibile aggiungere un carro ad e.g. alaska, rompere la condizione
        //e approfittarne quindi per toglierlo da un'altra nazione, perché per la nota 1. solo 
        // il - dell'alaska sarà abilitato

    }
}

function next(){
    //elimina tasti +/-
    while(Object.keys($(".cls-4 ~ image")).length > 2){
        let image = $(".cls-4 ~ image")[0]
        $(image).remove()
    }
    
    //disabilita dadi
    disable_dices(true)
    disable_dices(false)

    //disabilita bottoni
    Object.keys($("#dashboard button")).forEach(btn => { 
        try {
            btn = $("#dashboard button")[btn]
            if ($(btn).prop("tagName") == "BUTTON")
                $(btn).prop('disabled', true);
        } catch(exc) { /*do nothing*/ } 
    })

    window.gs.next();
}

function enable_dices(attack, n){
    
    console.log("DEVO ABILITARE " + n + " DADI")

    if (attack){
        $("#a1").removeClass("disabled")
        if (n > 1)
            $("#a2").removeClass("disabled")
        if (n > 2)
            $("#a3").removeClass("disabled")
    } else {
        $("#d1").removeClass("disabled")
        if (n > 1)
            $("#d2").removeClass("disabled")
        if (n > 2)
            $("#d3").removeClass("disabled")
    }
}

function disable_dices(attack){
    if (attack){
        $("#a1").addClass("disabled")
        $("#a2").addClass("disabled")
        $("#a3").addClass("disabled")
    } else {
        $("#d1").addClass("disabled")
        $("#d2").addClass("disabled")
        $("#d3").addClass("disabled")
    }
}
var selected_attack_dices = 0
function dice_action(dice){
    //non posso sempre selezionare tutti i dadi, es. 
    //se difendo da una nazione che ha solo 1 carro al massimo posso selezionare un dado
    if ($(dice).hasClass("disabled"))
        return;

    if ($(dice).css("border-left-width") != "0px"){
        selected_attack_dices -= 1
        $(dice).css("border", "0px")
    }
    else {
        $(dice).css("border", "solid")
        selected_attack_dices += 1
    }

    //Nota: i dadi sono disattivati se non ho selezionato due territori
    //e i territori devono essere confinanti
    if (selected_attack_dices > 0)
        $("#throw_dices").prop("disabled", false)

    
}

function throw_dice(){
    $("#throw_dices").prop('disabled', true)

    //cerchiamo i dadi attivi
    let attack = false;
    let numbers = []
    if ($("#a1").css("border-left-width") != "0px"){
        attack = true;
        let r = parseInt(Math.random()*10)%6 + 1
        numbers.push({"name": "a1", "value": r})
    }
    if ($("#a2").css("border-left-width") != "0px"){
        attack = true;
        let r = parseInt(Math.random()*10)%6 + 1
        numbers.push({"name": "a2", "value": r})

    }
    if ($("#a3").css("border-left-width") != "0px"){
        attack = true;
        let r = parseInt(Math.random()*10)%6 + 1
        numbers.push({"name": "a3", "value": r})

    }
    
    if ($("#d1").css("border-left-width") != "0px"){
        let r = parseInt(Math.random()*10)%6 + 1
        numbers.push({"name": "d1", "value": r})

    }
    if ($("#d2").css("border-left-width") != "0px"){
        let r = parseInt(Math.random()*10)%6 + 1
        numbers.push({"name": "d2", "value": r})

    }
    if ($("#d3").css("border-left-width") != "0px"){
        let r = parseInt(Math.random()*10)%6 + 1
        numbers.push({"name": "d3", "value": r})

    }

    numbers.forEach(n => {
        let img_name = "../images/dices/" + n.name;
        img_name = img_name.substring(0, img_name.length -1) + n.value + ".png"
        
        $(`#${n.name}`).attr("src",img_name);
        $(`#${n.name}`).css("border", "0px")

    })

    disable_dices(numbers[0].name.startsWith("a"));

    let _numbers = []
    numbers.forEach( n => { _numbers.push(n.value) })
    //comunica esito dei dadi agli altri
    if (attack){
        window.gs.attack_dices = _numbers
        window.comm.sendMessage({"command": "attack", "values": _numbers, "attacking": window.attacking_nation, "attacked": window.attacked_nation})

        $("#next-btn").prop("disabled", true)

        //TODO mostra messaggio "in attesa dell'avversario" o qualcosa del genere
        
    }
    else {
        let defense = {"command": "defense", "values": _numbers, "attacking": window.attacking_nation, "attacked": window.attacked_nation}
        window.comm.sendMessage(defense)
        window.gs.defend(defense)
    }
    
    
}

function set_dices(values, attack){
    console.log("Devo impostare i valori dei dadi di attacco: " + attack)
    console.log(values)
    let counter = 1
    values.forEach(n => {
        let img_name = "../images/dices/" + (attack ? "a" : "d") + n + ".png";
        let dice_name = (attack ? "a" : "d") + counter
        $(`#${dice_name}`).attr("src",img_name);
        $(`#${dice_name}`).css("border", "0px")

        counter += 1

    })
    
}

function draw_interface(with_tanks_buttons){
    //contatore carri
    updateTanksCounter(window.gs.me().getTanks())

    //obiettivo
    $("#obj_dashboard").empty()
    $("#obj_dashboard").append(`<img src="../images/cards/${window.gs.me().ps.getObjective().image}">`)

    //mappa
    window.gs.players.forEach( p => {
        Object.keys(p.countries).forEach( c => {
            let n = p.countries[c]
            draw_country(c, n, p.color)
        })
    })

    //carte
    $("#cards_dashboard").empty()
    window.gs.me().ps.cards.forEach(c => {

        let html = `<span class="card" name="${c.nome}"> <img src="../images/cards/${c.image}" onclick="card_action(this)"> </span>`
        $("#cards_dashboard").append(html)

    })

    if (with_tanks_buttons){
        //bottoni per aggiungere carri ai territori
        start_putting_tanks(Object.keys(window.gs.me().countries))
    }

}

var selected_combo_cards = 0
function card_action(img){
    if ($(img).css("border-left-width") != "0px"){
        selected_combo_cards -= 1
        $(img).css("border", "0px")
    }
    else {
        $(img).css("border", "solid")
        selected_combo_cards += 1
    }

    //Nota: i dadi sono disattivati se non ho selezionato due territori
    //e i territori devono essere confinanti
    if (selected_combo_cards == 3)
        $("#throw_dices").prop("disabled", false)

}


function draw_country(country_name, number, color){
    $(`#${country_name}`).css("fill", color)

    let text = $(`#${country_name}`).siblings()[0]
    $(text).text(number)

}

function askUserCombo(){
    alert("Hai una combo a disposizione! Se la vuoi sfruttare, seleziona le carte che vuoi usare e clicca 'Usa combo'")
    $("#combo_btn").show()
    var _cards = $(".cards")
    Object.keys(_cards).forEach( c => {
        $(_cards[c]).click( e => { 
            let element = $(e.target) 
            if (element.css("border") != "0px")
                element.css("border", "0px")
            else
                element.css("border", "solid")

        })
    })
}

function use_combo(){

    var _cards = $(".cards")
    var selected_cards = []
    Object.keys(_cards).forEach( c => {
        if ($(_cards[c]).css("border") != "0px"){
            selected_cards.append($(_cards[c]).attr('name'))
            $(_cards[c]).css("border", "0px")
        }
    })

    //ho raccolto le carte selezionate dall'utente, controlliamo che sia una combo
    let tanks = this.gs.me().useCombo(selected_cards)

    //abbiamo una combo, aggiorniamo la grafica: rimuoviamo le carte, nascondiamo il bottone...
    if (tanks > 0)
        draw_interface()

    $("#combo_btn").hide()
    $("#cards_dashboard").empty()


}

function attack_phase(){
    //disabilita bottoni dadi etc., rimuovi tasti +, - per le armate
    while(Object.keys($(".cls-4 ~ image")).length > 2){
        let image = $(".cls-4 ~ image")[0]
        $(image).remove()
    }

    $("#attack_phase_btn").prop('disabled', true)

    //la fase di attacco inizia dopo aver posizionato i carri, quindi devo segnalare agli
    //avversari le nuove quantità di carri sui miei territori

    window.comm.sendMessage({"command": "update_status", "turno": window.gs.me().turno, "tanks": window.gs.me().countries, "turn": window.gs.turn})

    console.log("Iniziamo la fase di attacco!")
    //mostra all'utente area messaggi per i territori selezionati come attacco/difesa
    window.attacking_nation = ""
    window.attacked_nation = ""
    //TODO $("#status").empty().show();

}

$(".cls-4").click( e => { let dices = setCountryForAttack(e.target); if (dices > 0 ) enable_dices(true, dices) ;})

function setCountryForAttack(country){

    //non si attacca al turno 0 o quando non è il mio turno
    if (window.gs.player_turn != window.gs.me().turno || window.gs.turn == 0)
        return

    //imposta il territorio come attaccante o di difesa;
    //se è possibile attaccare, restituisce il numero di dadi con cui si può attaccare
    //(0 in caso negativo, 1, 2 o 3)


    let name = $(country).prop("id")

    if (window.gs.me().countries[name]){ //la nazione è mia
        if (window.attacking_nation == name){
            //voglio deselezionare la nazione
            window.attacking_nation = ""
            console.log("Tolgo la nazione " + country + " come attaccante")
        } else {
            window.attacking_nation = name
            console.log("Imposto la nazione " + country + " come attaccante")
        }
    } else {
        if (window.attacked_nation == name){
            //voglio deselezionare la nazione
            window.attacked_nation = ""
            console.log("Tolgo la nazione " + country + " come attaccata")
        } else {
            window.attacked_nation = name
            console.log("Imposto la nazione " + country + " come attaccata")
        }
    }


    let number = 0
    if (window.attacking_nation && window.attacked_nation){
        //controlliamo che siano confinanti
        adjacency[window.attacking_nation].forEach( n => {
            let tanks = window.gs.me().countries[window.attacking_nation]
            if (n == window.attacked_nation){
                if (tanks > 3){
                    
                    number = 3
                }
                else if (tanks > 1){
                    number = window.gs.me().countries[window.attacking_nation] - 1
                }
            }
                
        })
    }

    console.log("posso attaccare con " + number + " dadi")

    return number;

}

